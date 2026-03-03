import { clsx } from 'clsx';

const variants = {
  primary: 'btn-primary',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg font-medium transition-colors',
  outline: 'btn-outline',
  danger: 'btn-danger',
  ghost: 'text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium transition-colors',
};

const sizes = {
  sm: 'text-sm px-3 py-1.5',
  md: '',
  lg: 'text-base px-6 py-3',
};

export default function Button({
  children, variant = 'primary', size = 'md', className, loading, icon, ...props
}) {
  return (
    <button
      className={clsx(variants[variant], sizes[size], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          {icon && icon}
          {children}
        </span>
      )}
    </button>
  );
}
