import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  { label, error, icon: Icon, className = '', wrapperClass = '', type = 'text', ...props },
  ref
) {
  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClass}`}>
      {label && (
        <label className="text-xs font-semibold text-ink-500 tracking-wide uppercase">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`
            w-full bg-card text-ink-900 border border-line
            rounded-input px-4 py-2.5 text-sm
            placeholder:text-ink-400
            shadow-input
            focus:outline-none focus:border-brand-500 focus:shadow-focus
            transition-all duration-150
            disabled:bg-muted-bg disabled:text-ink-400 disabled:cursor-not-allowed
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-alert-500 focus:border-alert-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-alert-600">{error}</span>}
    </div>
  );
});

export default Input;
