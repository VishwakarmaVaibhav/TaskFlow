export default function Avatar({ name, size = 'md', className = '' }) {
  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const sizes = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm',
    xl: 'w-14 h-14 text-base',
  };

  /* Deterministic colored backgrounds — all have dark text for readability */
  const palettes = [
    'bg-brand-100 text-brand-600',
    'bg-warning-100 text-warning-600',
    'bg-success-100 text-success-600',
    'bg-alert-100 text-alert-600',
    'bg-brand-50 text-brand-700',
    'bg-warning-50 text-warning-600',
  ];

  const idx = name ? name.charCodeAt(0) % palettes.length : 0;

  return (
    <div
      className={`
        ${sizes[size]} ${palettes[idx]}
        rounded-full flex items-center justify-center
        font-bold select-none shrink-0
        ${className}
      `}
      title={name}
    >
      {initials}
    </div>
  );
}
