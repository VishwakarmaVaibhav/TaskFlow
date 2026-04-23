import { motion } from 'framer-motion';

export default function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="flex flex-col items-center justify-center py-20 px-6"
    >
      {/* Icon box */}
      <div className="w-16 h-16 rounded-2xl bg-canvas border border-line
        flex items-center justify-center mb-5">
        <svg className="w-7 h-7 text-ink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          <path d="M12 12v4M12 12l2 2M12 12l-2 2" />
        </svg>
      </div>

      <h3 className="font-serif text-xl text-ink-900 mb-1.5">
        {title || 'No tasks yet'}
      </h3>
      <p className="text-sm text-ink-500 max-w-sm text-center mb-6 leading-relaxed">
        {description || 'Create your first task to get started.'}
      </p>

      {actionLabel && onAction && (
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAction}
          className="px-6 py-2.5 rounded-btn bg-brand-600 text-ink-white
            font-semibold text-sm hover:bg-brand-700 transition-colors duration-150"
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
}
