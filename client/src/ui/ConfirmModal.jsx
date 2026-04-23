import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

/*
  ConfirmModal — overlay dialog for destructive actions (delete, etc.).
  Replaces browser confirm() with a styled, themed modal.
*/

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  const getLoadingText = (label) => {
    if (label.toLowerCase() === 'delete') return 'Deleting...';
    if (label.toLowerCase() === 'sign out') return 'Signing out...';
    // Remove trailing 'e' and add 'ing' as a generic fallback, else just add 'ing'
    const word = label.split(' ')[0];
    const rest = label.split(' ').slice(1).join(' ');
    const stem = word.endsWith('e') ? word.slice(0, -1) : word;
    return `${stem}ing ${rest}...`.trim();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="absolute inset-0 bg-ink-900/25 backdrop-blur-sm"
            onClick={!loading ? onClose : undefined}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="relative w-full max-w-sm bg-card border border-line
              rounded-card shadow-modal overflow-hidden"
          >
            {/* Icon + Content */}
            <div className="px-6 py-6 text-center">
              {/* Warning icon */}
              <div className={`
                w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center
                ${variant === 'danger' ? 'bg-alert-50' : 'bg-brand-50'}
              `}>
                {variant === 'danger' ? (
                  <svg className="w-6 h-6 text-alert-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 9v4M12 17h.01" />
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                )}
              </div>

              <h3 className="text-lg font-semibold text-ink-900 mb-1.5">{title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{message}</p>
            </div>

            {/* Actions */}
            <div className="flex items-stretch border-t border-line">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-3 text-sm font-semibold text-ink-700
                  hover:bg-canvas transition-colors border-r border-line
                  disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`
                  flex-1 px-4 py-3 text-sm font-semibold transition-colors
                  disabled:opacity-50
                  ${variant === 'danger'
                    ? 'text-alert-600 hover:bg-alert-50'
                    : 'text-brand-600 hover:bg-brand-50'
                  }
                `}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    {getLoadingText(confirmLabel)}
                  </span>
                ) : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
