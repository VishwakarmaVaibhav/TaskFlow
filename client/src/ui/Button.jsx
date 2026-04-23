import { motion } from 'framer-motion';

/*
  Button Variants — all use CSS variable-backed Tailwind classes.
  Every variant explicitly sets BOTH background AND text color 
  to guarantee visibility/contrast.
*/
const variants = {
  primary:
    'bg-brand-600 text-ink-white font-semibold hover:bg-brand-700',
  secondary:
    'bg-card text-ink-700 font-medium border border-line hover:bg-canvas',
  danger:
    'bg-alert-600 text-ink-white font-semibold hover:bg-alert-500',
  ghost:
    'bg-transparent text-ink-500 font-medium hover:text-ink-900 hover:bg-canvas',
  success:
    'bg-success-600 text-ink-white font-semibold hover:bg-success-500',
  outline:
    'bg-transparent text-brand-600 font-semibold border border-brand-600 hover:bg-brand-50',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-btn',
  md: 'px-5 py-2.5 text-sm gap-2 rounded-btn',
  lg: 'px-7 py-3 text-sm gap-2.5 rounded-btn',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileHover={!isDisabled ? { y: -1 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      className={`
        inline-flex items-center justify-center
        transition-all duration-150 cursor-pointer
        focus-ring select-none
        ${variants[variant]}
        ${sizes[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
      {IconRight && !loading && <IconRight className="w-4 h-4" />}
    </motion.button>
  );
}
