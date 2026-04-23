import { forwardRef } from 'react';

const Textarea = forwardRef(function Textarea(
  { label, error, className = '', wrapperClass = '', ...props },
  ref
) {
  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClass}`}>
      {label && (
        <label className="text-xs font-semibold text-ink-500 tracking-wide uppercase">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={`
          w-full bg-card text-ink-900 border border-line
          rounded-input px-4 py-3 text-sm
          placeholder:text-ink-400
          shadow-input
          focus:outline-none focus:border-brand-500 focus:shadow-focus
          transition-all duration-150
          resize-none min-h-[100px]
          disabled:bg-muted-bg disabled:text-ink-400 disabled:cursor-not-allowed
          ${error ? 'border-alert-500 focus:border-alert-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-xs text-alert-600">{error}</span>}
    </div>
  );
});

export default Textarea;
