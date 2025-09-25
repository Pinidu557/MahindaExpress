import React from 'react';

const Input = ({ 
  label,
  error,
  icon,
  className = '',
  ...props 
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 text-lg">{icon}</span>
          </div>
        )}
        <input
          className={`form-input focus-ring w-full ${icon ? 'pl-10' : ''} ${error ? 'border-red-500 ring-red-200' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 animate-fadeIn">{error}</p>
      )}
    </div>
  );
};

export default Input;

