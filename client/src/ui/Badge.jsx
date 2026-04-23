/*
  Badge — Status indicators with solid, high-contrast fills.
  Uses CSS variable-backed colors for full MVC theming.
*/

const statusConfig = {
  todo: {
    label: 'Todo',
    bg: 'bg-brand-600',
    text: 'text-ink-white',
    dot: 'bg-ink-white',
  },
  'in-progress': {
    label: 'In Progress',
    bg: 'bg-warning-500',
    text: 'text-ink-900',
    dot: 'bg-ink-900',
  },
  done: {
    label: 'Done',
    bg: 'bg-success-500',
    text: 'text-ink-white',
    dot: 'bg-ink-white',
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export default function Badge({
  status,
  label,
  variant = 'status',
  size = 'md',
  className = '',
}) {
  if (variant === 'status' && status) {
    const config = statusConfig[status] || statusConfig.todo;
    return (
      <span
        className={`
          inline-flex items-center gap-1.5 font-bold rounded-pill
          ${config.bg} ${config.text}
          ${sizeClasses[size]}
          tracking-wide uppercase
          ${className}
        `}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {config.label}
      </span>
    );
  }

  /* Generic label badge — light bg, dark text */
  return (
    <span
      className={`
        inline-flex items-center gap-1 font-semibold rounded-pill
        bg-muted-bg text-ink-700
        ${sizeClasses[size]} tracking-wide
        ${className}
      `}
    >
      {label}
    </span>
  );
}
