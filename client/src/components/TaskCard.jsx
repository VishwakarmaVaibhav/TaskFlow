import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge, Avatar, AlertOverlay } from '../ui';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

/* Status options for the inline quick-switch */
const STATUSES = [
  { value: 'todo',        label: 'Todo',        dot: 'bg-brand-600',   bg: 'bg-brand-50',   text: 'text-brand-600' },
  { value: 'in-progress', label: 'In Progress', dot: 'bg-warning-500', bg: 'bg-warning-50', text: 'text-warning-600' },
  { value: 'done',        label: 'Done',        dot: 'bg-success-500', bg: 'bg-success-50', text: 'text-success-600' },
];

export default function TaskCard({ task, index = 0, onEdit, onDelete, onStatusChange }) {
  const { user } = useAuth();
  const [cardAlert, setCardAlert] = useState(null);

  const userId = user?.id;
  const isCreator = task.creator?._id === userId || task.creator?.id === userId;
  const isAssignee = task.assignee && (task.assignee?._id === userId || task.assignee?.id === userId);
  const isPersonal = !task.assignee;

  /* Who can change status? Creator (personal), or Assignee */
  const canChangeStatus = (isPersonal && isCreator) || isAssignee;

  const roleLabel = isPersonal ? 'Personal' : isCreator ? 'Assigner' : isAssignee ? 'Assignee' : 'Viewer';

  const roleStyles = {
    Personal: 'bg-muted-bg text-ink-700',
    Assigner: 'bg-brand-100 text-brand-600',
    Assignee: 'bg-warning-100 text-warning-600',
    Viewer:   'bg-muted-bg text-ink-500',
  };

  /* ─── Inline status dropdown state ─── */
  const [statusOpen, setStatusOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const statusRef = useRef(null);

  useEffect(() => {
    function close(e) {
      if (statusRef.current && !statusRef.current.contains(e.target)) setStatusOpen(false);
    }
    if (statusOpen) {
      document.addEventListener('mousedown', close);
      return () => document.removeEventListener('mousedown', close);
    }
  }, [statusOpen]);

  const handleStatusSwitch = async (newStatus) => {
    if (newStatus === task.status) { setStatusOpen(false); return; }
    setUpdatingStatus(true);
    try {
      const { data } = await API.put(`/tasks/${task._id}`, { status: newStatus });
      onStatusChange?.(data.task);
      setCardAlert({ type: 'success', message: `Status → ${newStatus.replace('-', ' ')}` });
    } catch (err) {
      setCardAlert({ type: 'error', message: err.response?.data?.message || 'Failed to update status' });
    } finally {
      setUpdatingStatus(false);
      setStatusOpen(false);
    }
  };

  /* ─── Date formatting ─── */
  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
    const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (task.status === 'done') return { text: `✓ ${formatted}`, cls: 'text-success-600 font-semibold' };
    if (diffDays < 0)  return { text: `Overdue · ${formatted}`, cls: 'text-alert-600 font-semibold' };
    if (diffDays <= 2) return { text: `Due soon · ${formatted}`, cls: 'text-warning-600 font-medium' };
    return { text: formatted, cls: 'text-ink-400' };
  };

  const dueDateInfo = formatDate(task.dueDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      layout
      className="bg-card border border-line rounded-card shadow-card
        hover:shadow-card-hover hover:-translate-y-0.5
        transition-all duration-200 group flex flex-col overflow-visible"
    >
      {/* ─── Card Body ─── */}
      <div className="p-5 flex flex-col flex-1">
        {/* Top — role pill + status badge (clickable if allowed) */}
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-pill text-[10px]
            font-bold uppercase tracking-widest ${roleStyles[roleLabel]}`}>
            {roleLabel}
          </span>

          {/* Status — inline toggle or static badge */}
          <div className="relative" ref={statusRef}>
            {canChangeStatus ? (
              <button
                onClick={() => setStatusOpen(!statusOpen)}
                disabled={updatingStatus}
                className="cursor-pointer"
                title="Click to change status"
              >
                <Badge status={task.status} size="sm" className={`
                  ${canChangeStatus ? 'hover:ring-2 hover:ring-brand-500/20 transition-shadow' : ''}
                  ${updatingStatus ? 'opacity-50' : ''}
                `} />
              </button>
            ) : (
              <Badge status={task.status} size="sm" />
            )}

            {/* Inline status dropdown */}
            <AnimatePresence>
              {statusOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.96 }}
                  transition={{ duration: 0.12 }}
                  className="absolute z-40 right-0 top-full mt-1.5 w-44
                    bg-card border border-line rounded-input shadow-card-hover overflow-hidden"
                >
                  <div className="px-3 py-2 border-b border-line-light">
                    <span className="text-[10px] font-bold text-ink-400 uppercase tracking-widest">
                      Change Status
                    </span>
                  </div>
                  {STATUSES.map((s) => {
                    const isActive = s.value === task.status;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => handleStatusSwitch(s.value)}
                        className={`
                          w-full text-left px-3 py-2 text-sm flex items-center gap-2.5
                          transition-colors duration-100
                          ${isActive ? `${s.bg} ${s.text} font-semibold` : 'text-ink-700 hover:bg-canvas'}
                        `}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.dot}`} />
                        <span className="flex-1">{s.label}</span>
                        {isActive && (
                          <svg className={`w-3.5 h-3.5 ${s.text}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Title */}
        <h4 className="font-semibold text-[15px] text-ink-900 leading-snug mb-1 line-clamp-2">
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-ink-500 leading-relaxed mb-4 line-clamp-2 flex-1">
            {task.description}
          </p>
        )}

        {/* Footer — person + date */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-line-light">
          <div className="flex items-center gap-2">
            {task.assignee ? (
              <>
                <Avatar name={isCreator ? task.assignee.name : task.creator.name} size="sm" />
                <span className="text-xs text-ink-500 truncate max-w-[100px]">
                  {isCreator ? task.assignee.name : task.creator.name}
                </span>
              </>
            ) : (
              <span className="text-xs text-ink-400">Only you</span>
            )}
          </div>

          {dueDateInfo && (
            <span className={`text-[11px] ${dueDateInfo.cls}`}>{dueDateInfo.text}</span>
          )}
        </div>
      </div>

      {/* ─── Action Bar — always visible, clean divider ─── */}
      <div className="flex items-stretch border-t border-line">
        {/* Edit */}
        <button
          onClick={() => onEdit(task)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5
            text-xs font-semibold text-ink-500
            hover:text-brand-600 hover:bg-brand-50
            transition-colors duration-150
            border-r border-line"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit
        </button>

        {/* Delete — only for creator */}
        {isCreator && (
          <button
            onClick={() => onDelete(task._id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5
              text-xs font-semibold text-ink-500
              hover:text-alert-600 hover:bg-alert-50
              transition-colors duration-150"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
            Delete
          </button>
        )}
      </div>

      {/* Status change alert */}
      <AlertOverlay alert={cardAlert} onDismiss={() => setCardAlert(null)} />
    </motion.div>
  );
}
