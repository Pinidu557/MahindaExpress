import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  className = '',
  ...props 
}) => {
  const getVariantClasses = (variant) => {
    const variants = {
      primary: 'btn-primary hover-glow',
      secondary: 'btn-secondary',
      danger: 'btn-danger hover-scale',
      success: 'btn-success hover-scale',
      outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
    };
    return variants[variant] || variants.primary;
  };

  const getSizeClasses = (size) => {
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };
    return sizes[size] || sizes.md;
  };

  const isDisabled = disabled || loading;
  const variantClasses = getVariantClasses(variant);
  const sizeClasses = getSizeClasses(size);

  return (
    <button
      className={`${variantClasses} ${sizeClasses} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="spinner w-4 h-4"></div>
          <span>Loading...</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          {children}
        </div>
      )}
    </button>
  );
};

export default Button;

