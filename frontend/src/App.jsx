import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { FilterBar } from './components/FilterBar';
import { JobList } from './components/JobList';
import { Sidebar } from './components/Sidebar';
import { ConcurrencyBanner } from './components/ConcurrencyBanner';
import { CreateJobModal } from './components/CreateJobModal';
import { ConcurrencyDemoModal } from './components/ConcurrencyDemoModal';
import { JobHistoryModal } from './components/JobHistoryModal';
import { ConfirmModal } from './components/ConfirmModal';
import { RulesModal } from './components/RulesModal';
import { AuthModal } from './components/AuthModal';
import { ToastContainer } from './components/Toast';
import { api } from './services/api';

export function App() {
  const [jobs, setJobs] = useState([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, running: 0, completed: 0, failed: 0 });
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [serverOnline, setServerOnline] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // User Authentication state
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('queuepilot_user');
      return saved ? JSON.parse(saved) : { name: 'Alex Mercer', email: 'alex.mercer@airth.dev', role: 'Queue Architect' };
    } catch {
      return null;
    }
  });

  // Modals & Drawers
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isConcurrencyOpen, setIsConcurrencyOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [historyJob, setHistoryJob] = useState(null);
  const [deleteConfirmJob, setDeleteConfirmJob] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, title, message) => {
    const id = Date.now() + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch jobs
  const fetchJobs = useCallback(async (showLoadingSpinner = false) => {
    if (showLoadingSpinner) setLoading(true);
    setError('');

    try {
      const res = await api.getJobs({
        status: activeFilter,
        search: searchQuery,
        sort: sortOrder
      });

      setJobs(res.data || []);
      if (res.counts) setCounts(res.counts);
      setServerOnline(true);
    } catch (err) {
      setError(err.message || 'Cannot reach backend on port 5000.');
      setServerOnline(false);
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  }, [activeFilter, searchQuery, sortOrder]);

  // Initial load
  useEffect(() => {
    fetchJobs(true);
  }, [fetchJobs]);

  // Auto-refresh interval (3 seconds)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchJobs(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchJobs]);

  // Status transition handler
  const handleUpdateStatus = async (id, newStatus, extra = {}) => {
    setUpdatingId(id);
    try {
      await api.updateJobStatus(id, newStatus, extra);
      addToast(
        'success',
        'Status Transitioned',
        `Job '${id.slice(0, 8)}' moved to '${newStatus}'.`
      );
      await fetchJobs(false);
    } catch (err) {
      if (err.status === 409) {
        addToast(
          'conflict',
          'Concurrency Conflict (HTTP 409)',
          err.message || `State was modified concurrently by another request.`
        );
      } else {
        addToast(
          'error',
          'Transition Error',
          err.message || 'Invalid state transition.'
        );
      }
      await fetchJobs(false);
    } finally {
      setUpdatingId(null);
    }
  };

  // Create job handler
  const handleCreateJob = async ({ title, type }) => {
    try {
      const res = await api.createJob({ title, type });
      addToast(
        'success',
        'Job Created',
        `"${title}" added to queue in 'pending' status.`
      );
      await fetchJobs(false);
      return res;
    } catch (err) {
      addToast('error', 'Creation Failed', err.message);
      throw err;
    }
  };

  // Delete job handler
  const handleConfirmDelete = async () => {
    if (!deleteConfirmJob) return;
    setDeleting(true);
    try {
      await api.deleteJob(deleteConfirmJob.id);
      addToast('info', 'Job Deleted', `Job '${deleteConfirmJob.id}' was removed.`);
      setDeleteConfirmJob(null);
      await fetchJobs(false);
    } catch (err) {
      addToast('error', 'Delete Failed', err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('queuepilot_user');
    setUser(null);
    addToast('info', 'Logged Out', 'You have been logged out.');
  };

  const pendingJobs = jobs.filter((j) => j.status === 'pending');

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Header matching Figma screenshot */}
      <Header
        totalJobs={counts.total || 0}
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenConcurrency={() => setIsConcurrencyOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(true)}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onRefresh={() => fetchJobs(true)}
        loading={loading}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
        {/* Concurrency Note (transition rules reference panel) */}
        <ConcurrencyBanner onOpenConcurrency={() => setIsConcurrencyOpen(true)} />

        {/* 4 Metric Cards (PENDING, RUNNING, COMPLETED, FAILED) */}
        <StatsOverview
          counts={counts}
          activeFilter={activeFilter}
          onSelectFilter={(filter) => setActiveFilter(filter)}
        />

        {/* Filter row matching Figma screenshot */}
        <FilterBar
          activeFilter={activeFilter}
          onSelectFilter={(filter) => setActiveFilter(filter)}
          counts={counts}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          autoRefresh={autoRefresh}
          onToggleAutoRefresh={() => setAutoRefresh(!autoRefresh)}
        />

        {/* Data Table matching Figma screenshot */}
        <JobList
          jobs={jobs}
          loading={loading}
          error={error}
          onRetry={() => fetchJobs(true)}
          onOpenCreate={() => setIsCreateOpen(true)}
          onUpdateStatus={handleUpdateStatus}
          onDeleteJob={(job) => setDeleteConfirmJob(job)}
          onViewHistory={(job) => setHistoryJob(job)}
          updatingId={updatingId}
          activeFilter={activeFilter}
        />
      </main>

      {/* Sidebar Drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeFilter={activeFilter}
        onSelectFilter={(filter) => setActiveFilter(filter)}
        counts={counts}
        serverOnline={serverOnline}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenConcurrency={() => setIsConcurrencyOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
      />

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={user}
        onLogin={(userData) => setUser(userData)}
        onLogout={handleLogout}
      />

      <CreateJobModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateJob={handleCreateJob}
      />

      <ConcurrencyDemoModal
        isOpen={isConcurrencyOpen}
        onClose={() => setIsConcurrencyOpen(false)}
        pendingJobs={pendingJobs}
        onJobUpdated={() => fetchJobs(false)}
      />

      <JobHistoryModal
        isOpen={Boolean(historyJob)}
        job={historyJob}
        onClose={() => setHistoryJob(null)}
      />

      <ConfirmModal
        isOpen={Boolean(deleteConfirmJob)}
        job={deleteConfirmJob}
        onClose={() => setDeleteConfirmJob(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
