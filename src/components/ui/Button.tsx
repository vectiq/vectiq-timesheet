interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center rounded-md font-medium 
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-[0.98]
  `;
  
  const variants = {
    primary: `
      bg-indigo-600 text-white 
      hover:bg-indigo-700 hover:shadow-md
      focus:ring-indigo-500
      active:bg-indigo-800
    `,
    secondary: `
      bg-white text-gray-700 
      hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm
      focus:ring-indigo-500 
      border border-gray-300
      active:bg-gray-100
    `,
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${loading ? 'relative !text-transparent' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    > 
      {children}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      )}
    </button>
  );
}