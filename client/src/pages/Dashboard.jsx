import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Layout from '../components/Layout';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import EmptyState from '../components/EmptyState';
import { Button, Badge, SkeletonDashboard, ConfirmModal, AlertOverlay } from '../ui';

const FILTERS = [
  { key: 'all', label: 'All Tasks' },
  { key: 'todo', label: 'Todo' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
  { key: 'personal', label: 'Personal' },
  { key: 'assigned', label: 'Assigned' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  /* ─── Confirm Delete state ─── */
  const [deleteTarget, setDeleteTarget] = useState(null);   // task _id to delete
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ─── Alert overlay state ─── */
  const [alert, setAlert] = useState(null); // { type: 'success'|'error'|'info', message: string }

  const showAlert = (type, message, detail) => setAlert({ type, message, detail });
  const dismissAlert = useCallback(() => setAlert(null), []);

  const fetchTasks = useCallback(async () => {
    try {
      setError('');
      const { data } = await API.get('/tasks');
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  /* ─── WebSockets logic for real-time updates ─── */
  useEffect(() => {
    if (!user) return;

    // If in production, connect to the underlying host root of the API
    let socketUrl = 'http://localhost:5001';
    if (import.meta.env.VITE_API_URL) {
      let envUrl = import.meta.env.VITE_API_URL.replace(/\/$/, ''); // stripped trailing slash
      socketUrl = envUrl.endsWith('/api') ? envUrl.slice(0, -4) : envUrl;
    }

    const socket = io(socketUrl, {
      withCredentials: true,
    });

    socket.on('connect', () => {
      // Connect specifically to our personal room.
      // The auth endpoint returns `{ id, name, email }`, so we use `user.id`.
      socket.emit('join_room', user.id || user._id);
    });

    socket.on('task_created', (newTask) => {
      setTasks((prev) => {
        // Avoid duplicate additions if we created it and it was already prepended
        if (prev.some((t) => t._id === newTask._id)) return prev;
        return [newTask, ...prev];
      });
    });

    socket.on('task_updated', (updatedTask) => {
      setTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)));
    });

    socket.on('task_deleted', (deletedTaskId) => {
      setTasks((prev) => prev.filter((t) => t._id !== deletedTaskId));
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true;
    if (filter === 'personal') return !task.assignee;
    if (filter === 'assigned') return !!task.assignee;
    return task.status === filter;
  });

  const counts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
    personal: tasks.filter((t) => !t.assignee).length,
    assigned: tasks.filter((t) => !!t.assignee).length,
  };

  const openCreateModal = () => { setEditingTask(null); setModalOpen(true); };
  const openEditModal = (task) => { setEditingTask(task); setModalOpen(true); };

  const handleSave = (savedTask, action) => {
    if (action === 'created') {
      setTasks((prev) => {
        if (prev.some((t) => t._id === savedTask._id)) return prev;
        return [savedTask, ...prev];
      });
      showAlert('success', 'Task created successfully');
    } else {
      setTasks((prev) => prev.map((t) => (t._id === savedTask._id ? savedTask : t)));
      showAlert('success', 'Task updated successfully');
    }
  };

  /* Inline status change from card */
  const handleStatusChange = (updatedTask) => {
    setTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)));
  };

  /* Open confirm modal instead of browser confirm() */
  const requestDelete = (taskId) => {
    setDeleteTarget(taskId);
  };

  /* Actually perform the delete */
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await API.delete(`/tasks/${deleteTarget}`);
      setTasks((prev) => prev.filter((t) => t._id !== deleteTarget));
      showAlert('success', 'Task deleted');
      setDeleteTarget(null);
    } catch (err) {
      showAlert('error', 'Failed to delete task', err.response?.data?.message || 'Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
    setDeleteLoading(false);
  };

  const completionRate = tasks.length ? Math.round((counts.done / tasks.length) * 100) : 0;

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  })();

  return (
    <Layout>
      {/* ─── Alert overlay (success/error) ─── */}
      <AlertOverlay alert={alert} onDismiss={dismissAlert} />

      {/* ─── Confirm Delete Modal ─── */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Task"
        message="This task will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleteLoading}
      />

      {/* ─── Full-page loading skeleton ─── */}
      {loading ? (
        <SkeletonDashboard />
      ) : (
        <>
          {/* ─── Page Header ─── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="font-serif text-3xl sm:text-4xl text-ink-900 leading-tight mb-1">
                  Good {greeting}, {user?.name?.split(' ')[0]}
                </h1>
              </div>

              <Button variant="primary" onClick={openCreateModal}
                icon={() => (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                )}
              >
                New Task
              </Button>
            </div>

            {/* ─── Stats Card ─── */}
            {tasks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.15 }}
                className="bg-card border border-line rounded-card shadow-card p-5
                  flex flex-wrap items-center gap-6"
              >
                {/* Completion ring */}
                <div className="flex items-center gap-3">
                  <div className="relative w-11 h-11">
                    <svg className="w-11 h-11 transform -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.5" fill="none"
                        stroke="var(--line)" strokeWidth="2.5" />
                      <circle cx="18" cy="18" r="15.5" fill="none"
                        stroke={completionRate === 100 ? 'var(--success-500)' : 'var(--brand-600)'}
                        strokeWidth="2.5"
                        strokeDasharray={`${completionRate}, 100`}
                        strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[11px]
                      font-bold text-ink-900">
                      {completionRate}%
                    </span>
                  </div>
                  <div>
                    <div className="text-[10px] text-ink-400 uppercase tracking-wider font-semibold">Done</div>
                    <div className="text-sm font-bold text-ink-900">{counts.done}/{tasks.length}</div>
                  </div>
                </div>

                <div className="hidden sm:block w-px h-9 bg-line" />

                {/* Status badges with counts */}
                <div className="flex items-center gap-4 flex-wrap">
                  {[
                    { status: 'todo', count: counts.todo },
                    { status: 'in-progress', count: counts['in-progress'] },
                    { status: 'done', count: counts.done },
                  ].map((s) => (
                    <div key={s.status} className="flex items-center gap-2">
                      <Badge status={s.status} size="sm" />
                      <span className="text-sm font-bold text-ink-900">{s.count}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* ─── Filter Tabs ─── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-1"
          >
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`
                  px-4 py-2 rounded-btn text-xs font-semibold
                  transition-all duration-150 whitespace-nowrap
                  ${filter === f.key
                    ? 'bg-brand-600 text-ink-white'
                    : 'bg-card text-ink-700 border border-line hover:bg-canvas'
                  }
                `}
              >
                {f.label}
                <span className={`ml-1.5 text-[10px] ${filter === f.key ? 'text-ink-white/60' : 'text-ink-400'}`}>
                  {counts[f.key]}
                </span>
              </button>
            ))}
          </motion.div>

          {/* ─── Task Grid ─── */}
          {error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card border border-line rounded-card shadow-card p-8 text-center"
            >
              <p className="text-sm text-alert-600 mb-3">{error}</p>
              <Button variant="secondary" size="sm" onClick={fetchTasks}>Try Again</Button>
            </motion.div>
          ) : filteredTasks.length === 0 ? (
            <EmptyState
              title={filter === 'all' ? 'No tasks yet' : `No ${filter.replace('-', ' ')} tasks`}
              description={
                filter === 'all'
                  ? 'Create your first task to organize your workflow and collaborate with your team.'
                  : `No tasks with "${filter.replace('-', ' ')}" status right now.`
              }
              actionLabel={filter === 'all' ? 'Create Your First Task' : undefined}
              onAction={filter === 'all' ? openCreateModal : undefined}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredTasks.map((task, i) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    index={i}
                    onEdit={openEditModal}
                    onDelete={requestDelete}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      <TaskModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(null); }}
        task={editingTask}
        onSave={handleSave}
      />
    </Layout>
  );
}
