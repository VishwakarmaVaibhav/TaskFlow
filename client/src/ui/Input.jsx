import { forwardRef, useState } from 'react';

const Input = forwardRef(function Input(
  { label, error, icon: Icon, className = '', wrapperClass = '', type = 'text', ...props },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const currentType = isPassword ? (showPassword ? 'text' : 'password') : type;

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
          type={currentType}
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
            ${isPassword ? 'pr-10' : ''}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 transition-colors focus:outline-none"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              // Eye crossed out icon
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              // Eye icon
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <span className="text-xs text-alert-600">{error}</span>}
    </div>
  );
});

export default Input;
