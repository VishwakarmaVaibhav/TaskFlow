import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/*
  AlertOverlay — full-screen overlay notification for success/error/info.
  Auto-dismisses after a timeout. Replaces react-hot-toast.
*/

const icons = {
  success: (
    <svg className="w-7 h-7 text-success-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12l3 3 5-5" />
    </svg>
  ),
  error: (
    <svg className="w-7 h-7 text-alert-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  ),
  info: (
    <svg className="w-7 h-7 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  ),
};

const bgStyles = {
  success: 'border-success-100',
  error: 'border-alert-100',
  info: 'border-brand-100',
};

export default function AlertOverlay({ alert, onDismiss }) {
  // Auto dismiss after 2.5s
  useEffect(() => {
    if (alert) {
      const t = setTimeout(() => onDismiss(), 2500);
      return () => clearTimeout(t);
    }
  }, [alert, onDismiss]);

  return (
    <AnimatePresence>
      {alert && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 28, stiffness: 400 }}
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[70]
            w-auto min-w-[280px] max-w-md"
        >
          <div
            className={`
              bg-card border ${bgStyles[alert.type] || bgStyles.info}
              rounded-card shadow-modal
              flex items-center gap-3 px-5 py-4 cursor-pointer
            `}
            onClick={onDismiss}
          >
            <div className="shrink-0">{icons[alert.type] || icons.info}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink-900">{alert.message}</p>
              {alert.detail && (
                <p className="text-xs text-ink-500 mt-0.5">{alert.detail}</p>
              )}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onDismiss(); }}
              className="shrink-0 text-ink-400 hover:text-ink-900 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
