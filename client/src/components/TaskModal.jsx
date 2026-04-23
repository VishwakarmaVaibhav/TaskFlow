import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Modal, Input, Textarea, Select, Button } from '../ui';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const STATUS_OPTIONS = [
  { value: 'todo', label: 'Todo' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

export default function TaskModal({ isOpen, onClose, task, onSave }) {
  const { user } = useAuth();
  const isEditing = !!task;

  const userId = user?.id;
  const isCreator = task && (task.creator?._id === userId || task.creator?.id === userId);
  const isAssignee = task && task.assignee && (task.assignee?._id === userId || task.assignee?.id === userId);
  const isPersonal = task ? !task.assignee : true;

  const canEditTitle = !isEditing || (isPersonal && isCreator);
  const canEditDescription = !isEditing || (isPersonal && isCreator);
  const canEditStatus = !isEditing || (isPersonal && isCreator) || isAssignee;
  const canEditDueDate = !isEditing || (isPersonal && isCreator) || (!isPersonal && isCreator);
  const canEditAssignee = !isEditing || (isPersonal && isCreator);

  const [form, setForm] = useState({ title: '', description: '', status: 'todo', dueDate: '', assignee: '' });
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [assigneeSuggestions, setAssigneeSuggestions] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* Should we highlight the status field? 
     Yes when editing AND user can only change status (assignee role) */
  const highlightStatus = isEditing && canEditStatus && !canEditTitle;

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setForm({
          title: task.title || '',
          description: task.description || '',
          status: task.status || 'todo',
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
          assignee: task.assignee?._id || task.assignee?.id || '',
        });
        setSelectedAssignee(task.assignee || null);
        setAssigneeSearch(task.assignee?.name || '');
      } else {
        setForm({ title: '', description: '', status: 'todo', dueDate: '', assignee: '' });
        setSelectedAssignee(null);
        setAssigneeSearch('');
      }
      setError('');
    }
  }, [isOpen, task]);

  const searchUsers = useCallback(async (query) => {
    if (query.length < 2) { setAssigneeSuggestions([]); return; }
    try {
      const { data } = await API.get(`/users/search?q=${encodeURIComponent(query)}`);
      setAssigneeSuggestions(data.users || []);
    } catch { setAssigneeSuggestions([]); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchUsers(assigneeSearch), 300);
    return () => clearTimeout(t);
  }, [assigneeSearch, searchUsers]);

  const selectAssignee = (u) => {
    setSelectedAssignee(u);
    setForm((f) => ({ ...f, assignee: u._id }));
    setAssigneeSearch(u.name);
    setAssigneeSuggestions([]);
  };

  const clearAssignee = () => {
    setSelectedAssignee(null);
    setForm((f) => ({ ...f, assignee: '' }));
    setAssigneeSearch('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEditing) {
        const payload = {};
        if (canEditTitle) payload.title = form.title;
        if (canEditDescription) payload.description = form.description;
        if (canEditStatus) payload.status = form.status;
        if (canEditDueDate) payload.dueDate = form.dueDate || null;
        if (canEditAssignee) payload.assignee = form.assignee || null;
        const { data } = await API.put(`/tasks/${task._id}`, payload);
        onSave(data.task, 'updated');
      } else {
        const { data } = await API.post('/tasks', {
          title: form.title,
          description: form.description,
          status: form.status,
          dueDate: form.dueDate || null,
          assignee: form.assignee || null,
        });
        onSave(data.task, 'created');
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const permHint = (() => {
    if (!isEditing) return null;
    if (isPersonal && isCreator) return null;
    if (!isPersonal && isCreator)
      return { text: 'As the assigner, you can only update the due date.' };
    if (isAssignee)
      return { text: 'As the assignee, you can update the status. Use the dropdown below.' };
    return null;
  })();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Task' : 'New Task'} size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Permission hint */}
        {permHint && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 px-4 py-3 rounded-btn
              bg-brand-50 border border-brand-100"
          >
            <span className="text-base leading-none mt-0.5">{permHint.icon}</span>
            <span className="text-sm text-brand-600 font-medium">{permHint.text}</span>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <div className="px-4 py-2.5 rounded-btn bg-alert-50 border border-alert-100 text-sm text-alert-600">
            {error}
          </div>
        )}

        <Input
          label="Title"
          placeholder="What needs to be done?"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          disabled={!canEditTitle}
          required
        />

        <Textarea
          label="Description"
          placeholder="Add details..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          disabled={!canEditDescription}
        />

        {/* Status & Due Date row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Status — custom dropdown with highlight on assignee edit */}
          <div className="relative">
            {/* {highlightStatus && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute -top-2 -right-2 z-10"
              >
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-600"></span>
                </span>
              </motion.div>
            )} */}
            <Select
              label="Status"
              options={STATUS_OPTIONS}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              disabled={!canEditStatus}
              highlight={highlightStatus}
            />
          </div>

          <Input
            label="Due Date"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            disabled={!canEditDueDate}
          />
        </div>

        {/* Assign to */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-ink-500 tracking-wide uppercase">
            Assign To
          </label>
          {selectedAssignee ? (
            <div className="flex items-center gap-2 bg-card border border-line rounded-input px-4 py-2.5 shadow-input">
              <span className="text-sm text-ink-900 flex-1">
                {selectedAssignee.name} ({selectedAssignee.email})
              </span>
              {canEditAssignee && (
                <button
                  type="button"
                  onClick={clearAssignee}
                  className="text-ink-400 hover:text-alert-600 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ) : (
            <div className="relative">
              <Input
                placeholder="Search users by name or email..."
                value={assigneeSearch}
                onChange={(e) => setAssigneeSearch(e.target.value)}
                disabled={!canEditAssignee}
              />
              {assigneeSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 z-20
                  bg-card border border-line rounded-input shadow-card-hover max-h-40 overflow-y-auto">
                  {assigneeSuggestions.map((u) => (
                    <button
                      key={u._id}
                      type="button"
                      onClick={() => selectAssignee(u)}
                      className="w-full text-left px-4 py-2.5 text-sm text-ink-900
                        hover:bg-canvas transition-colors
                        border-b border-line-light last:border-0"
                    >
                      <div className="font-medium text-ink-900">{u.name}</div>
                      <div className="text-xs text-ink-400">{u.email}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" variant="primary" loading={loading} className="flex-1">
            {isEditing ? 'Save Changes' : 'Create Task'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
