import { useState, useRef, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/*
  Custom Select — fully styled dropdown (no native <select>).
  Supports label, error, disabled, and highlight (pulse glow) states.
  Colors reference tailwind.config.js tokens.
*/

const Select = forwardRef(function Select(
  {
    label,
    error,
    options = [],
    value,
    onChange,
    disabled = false,
    highlight = false,
    className = '',
    wrapperClass = '',
    placeholder = 'Select...',
    ...props
  },
  ref
) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selectedOption = options.find((o) => o.value === value);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  // Close on escape
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('keydown', handleKey);
      return () => document.removeEventListener('keydown', handleKey);
    }
  }, [open]);

  const handleSelect = (optValue) => {
    if (disabled) return;
    onChange?.({ target: { value: optValue } });
    setOpen(false);
  };

  /* Status color dot (if option has a `color` key) */
  const dotColor = (opt) => {
    const map = {
      todo: 'bg-brand-600',
      'in-progress': 'bg-warning-500',
      done: 'bg-success-500',
    };
    return map[opt.value] || null;
  };

  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClass}`} ref={wrapperRef}>
      {label && (
        <label className="text-xs font-semibold text-ink-500 tracking-wide uppercase">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Trigger button */}
        <button
          ref={ref}
          type="button"
          onClick={() => !disabled && setOpen(!open)}
          disabled={disabled}
          className={`
            w-full bg-card text-left text-ink-900 border
            rounded-input px-4 py-2.5 text-sm
            shadow-input flex items-center justify-between gap-2
            transition-all duration-200
            focus:outline-none
            disabled:bg-muted-bg disabled:text-ink-400 disabled:cursor-not-allowed
            ${open ? 'border-brand-500 shadow-focus' : 'border-line'}
            ${error ? 'border-alert-500' : ''}
            ${highlight && !open
              ? 'border-brand-500 ring-2 ring-brand-500/20 animate-pulse'
              : ''
            }
            ${className}
          `}
          {...props}
        >
          <span className="flex items-center gap-2 truncate">
            {selectedOption && dotColor(selectedOption) && (
              <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor(selectedOption)}`} />
            )}
            <span className={selectedOption ? 'text-ink-900' : 'text-ink-400'}>
              {selectedOption?.label || placeholder}
            </span>
          </span>

          {/* Chevron */}
          <motion.svg
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="w-4 h-4 text-ink-400 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m6 9 6 6 6-6" />
          </motion.svg>
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute z-30 top-full left-0 right-0 mt-1.5
                bg-card border border-line rounded-input shadow-card-hover
                overflow-hidden"
            >
              {options.map((opt) => {
                const isSelected = opt.value === value;
                const dot = dotColor(opt);

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`
                      w-full text-left px-4 py-2.5 text-sm
                      flex items-center gap-2.5
                      transition-colors duration-100
                      ${isSelected
                        ? 'bg-brand-50 text-brand-600 font-semibold'
                        : 'text-ink-700 hover:bg-canvas'
                      }
                    `}
                  >
                    {dot && (
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dot}`} />
                    )}
                    <span className="flex-1">{opt.label}</span>
                    {isSelected && (
                      <svg className="w-4 h-4 text-brand-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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

      {error && <span className="text-xs text-alert-600">{error}</span>}
    </div>
  );
});

export default Select;
