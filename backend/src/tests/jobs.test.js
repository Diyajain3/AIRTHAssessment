const request = require('supertest');
const app = require('../app');
const { getDatabase, closeDatabase } = require('../config/database');

describe('Job Queue API & Concurrency Control Suite', () => {
  let db;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    db = getDatabase(':memory:');
  });

  afterAll(() => {
    closeDatabase();
  });

  describe('1. Health & Initial State', () => {
    it('GET /health returns healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('healthy');
    });

    it('GET /jobs returns empty list initially in test db', async () => {
      const res = await request(app).get('/jobs');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.counts).toBeDefined();
      expect(res.body.counts.total).toBe(0);
    });
  });

  describe('2. Job Creation & Validation', () => {
    it('POST /jobs rejects missing title', async () => {
      const res = await request(app)
        .post('/jobs')
        .send({ type: 'EMAIL_DISPATCH' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/title is required/i);
    });

    it('POST /jobs rejects missing type', async () => {
      const res = await request(app)
        .post('/jobs')
        .send({ title: 'Send Newsletter' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/type is required/i);
    });

    it('POST /jobs successfully creates a job in pending status', async () => {
      const res = await request(app)
        .post('/jobs')
        .send({
          title: 'Export Customer CSV',
          type: 'DATA_EXPORT'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.title).toBe('Export Customer CSV');
      expect(res.body.data.type).toBe('DATA_EXPORT');
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data.version).toBe(1);
    });
  });

  describe('3. State Machine Transitions', () => {
    let testJobId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/jobs')
        .send({
          title: 'State Transition Test Job',
          type: 'TEST_PROCESS'
        });
      testJobId = res.body.data.id;
    });

    it('Allows valid transition: pending -> running', async () => {
      const res = await request(app)
        .patch(`/jobs/${testJobId}/status`)
        .send({ status: 'running' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('running');
      expect(res.body.data.version).toBe(2);
    });

    it('Disallows invalid transition: pending -> completed directly', async () => {
      const res = await request(app)
        .patch(`/jobs/${testJobId}/status`)
        .send({ status: 'completed' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error.message).toMatch(/Invalid state transition/i);
    });

    it('Disallows invalid transition: pending -> failed directly', async () => {
      const res = await request(app)
        .patch(`/jobs/${testJobId}/status`)
        .send({ status: 'failed' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error.message).toMatch(/Invalid state transition/i);
    });

    it('Allows valid lifecycle: pending -> running -> completed', async () => {
      // 1. pending -> running
      const step1 = await request(app)
        .patch(`/jobs/${testJobId}/status`)
        .send({ status: 'running' });
      expect(step1.statusCode).toBe(200);
      expect(step1.body.data.status).toBe('running');

      // 2. running -> completed
      const step2 = await request(app)
        .patch(`/jobs/${testJobId}/status`)
        .send({ status: 'completed' });
      expect(step2.statusCode).toBe(200);
      expect(step2.body.data.status).toBe('completed');

      // 3. completed -> running MUST FAIL (terminal state)
      const step3 = await request(app)
        .patch(`/jobs/${testJobId}/status`)
        .send({ status: 'running' });
      expect(step3.statusCode).toBe(409);
      expect(step3.body.error.message).toMatch(/terminal state 'completed'/i);
    });

    it('Allows valid lifecycle: pending -> running -> failed and prevents running again', async () => {
      // 1. pending -> running
      await request(app)
        .patch(`/jobs/${testJobId}/status`)
        .send({ status: 'running' });

      // 2. running -> failed
      const failRes = await request(app)
        .patch(`/jobs/${testJobId}/status`)
        .send({ status: 'failed' });
      expect(failRes.statusCode).toBe(200);
      expect(failRes.body.data.status).toBe('failed');

      // 3. failed -> running MUST FAIL (terminal state)
      const restartRes = await request(app)
        .patch(`/jobs/${testJobId}/status`)
        .send({ status: 'running' });
      expect(restartRes.statusCode).toBe(409);
      expect(restartRes.body.error.message).toMatch(/terminal state 'failed'/i);
    });
  });

  describe('4. Real-World Concurrency & Race Condition Handling', () => {
    it('Handles 10 concurrent requests trying to transition a pending job to running: exactly 1 succeeds and 9 get 409 Conflict', async () => {
      // Create a pending job
      const created = await request(app)
        .post('/jobs')
        .send({
          title: 'Concurrency Benchmark Job',
          type: 'PARALLEL_TEST'
        });
      const jobId = created.body.data.id;

      // Fire 10 simultaneous requests
      const promises = Array.from({ length: 10 }, (_, index) =>
        request(app)
          .patch(`/jobs/${jobId}/status`)
          .send({
            status: 'running',
            reason: `Client Request #${index + 1}`
          })
      );

      const responses = await Promise.all(promises);

      const successCount = responses.filter((r) => r.statusCode === 200).length;
      const conflictCount = responses.filter((r) => r.statusCode === 409).length;

      expect(successCount).toBe(1);
      expect(conflictCount).toBe(9);

      // Verify final job state is cleanly running with version 2
      const finalJob = await request(app).get(`/jobs/${jobId}`);
      expect(finalJob.body.data.status).toBe('running');
      expect(finalJob.body.data.version).toBe(2);
    });

    it('Simulate race endpoint (/jobs/:id/simulate-race) demonstrates tab concurrency', async () => {
      const created = await request(app)
        .post('/jobs')
        .send({
          title: 'Tab 1 vs Tab 2 Race Job',
          type: 'DEMO_RACE'
        });
      const jobId = created.body.data.id;

      const res = await request(app).post(`/jobs/${jobId}/simulate-race`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.conflictHandlingConfirmed).toBe(true);
      expect(res.body.data.results.length).toBe(2);

      const statuses = res.body.data.results.map((r) => r.status);
      expect(statuses).toContain(200);
      expect(statuses).toContain(409);
    });
  });

  describe('5. Audit Logs & Deletion', () => {
    it('Records full transition audit log', async () => {
      const created = await request(app)
        .post('/jobs')
        .send({
          title: 'Audit Log Test Job',
          type: 'AUDIT_TEST'
        });
      const jobId = created.body.data.id;

      await request(app).patch(`/jobs/${jobId}/status`).send({ status: 'running' });
      await request(app).patch(`/jobs/${jobId}/status`).send({ status: 'completed' });

      const logsRes = await request(app).get(`/jobs/${jobId}/logs`);
      expect(logsRes.statusCode).toBe(200);
      expect(logsRes.body.data.length).toBe(3); // created (pending), running, completed
      expect(logsRes.body.data[0].toStatus).toBe('pending');
      expect(logsRes.body.data[1].toStatus).toBe('running');
      expect(logsRes.body.data[2].toStatus).toBe('completed');
    });

    it('DELETE /jobs/:id deletes the job and its cascade logs', async () => {
      const created = await request(app)
        .post('/jobs')
        .send({
          title: 'Job To Be Deleted',
          type: 'DELETE_TEST'
        });
      const jobId = created.body.data.id;

      const deleteRes = await request(app).delete(`/jobs/${jobId}`);
      expect(deleteRes.statusCode).toBe(200);
      expect(deleteRes.body.data.deleted).toBe(true);

      const getRes = await request(app).get(`/jobs/${jobId}`);
      expect(getRes.statusCode).toBe(404);
    });
  });
});
