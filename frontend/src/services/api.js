const API_BASE = import.meta.env.VITE_API_URL || '';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const error = new Error(data?.error?.message || `HTTP ${res.status} Error`);
      error.status = res.status;
      error.code = data?.error?.code || 'UNKNOWN_ERROR';
      error.details = data?.error?.details || null;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      const connErr = new Error('Cannot connect to backend server. Make sure the Node/Express backend is running on port 5000.');
      connErr.status = 0;
      connErr.code = 'NETWORK_ERROR';
      throw connErr;
    }
    throw err;
  }
}

export const api = {
  // Get all jobs with optional status filter & search
  getJobs: async ({ status = 'all', search = '', sort = 'desc' } = {}) => {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);
    if (sort) params.append('sort', sort);

    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/jobs${query}`);
  },

  // Create a new job
  createJob: async ({ title, type }) => {
    return request('/jobs', {
      method: 'POST',
      body: JSON.stringify({ title, type })
    });
  },

  // Update job status
  updateJobStatus: async (id, status, extra = {}) => {
    return request(`/jobs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status,
        expectedCurrentStatus: extra.expectedCurrentStatus,
        reason: extra.reason
      })
    });
  },

  // Delete a job
  deleteJob: async (id) => {
    return request(`/jobs/${id}`, {
      method: 'DELETE'
    });
  },

  // Fetch job state audit logs
  getJobLogs: async (id) => {
    return request(`/jobs/${id}/logs`);
  },

  // Concurrency race condition simulation
  simulateRace: async (id) => {
    return request(`/jobs/${id}/simulate-race`, {
      method: 'POST'
    });
  },

  // Health check
  checkHealth: async () => {
    return request('/health');
  }
};
