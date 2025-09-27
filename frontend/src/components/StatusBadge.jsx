import React from 'react';

const StatusBadge = ({ 
  status, 
  type = 'default',
  size = 'sm',
  className = ''
}) => {
  const getStatusConfig = (status, type) => {
    const configs = {
      // Maintenance status
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      completed: { color: 'bg-green-100 text-green-800', icon: '✅' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: '❌' },
      
      // Stock status
      inStock: { color: 'bg-green-100 text-green-800', icon: '✅' },
      lowStock: { color: 'bg-yellow-100 text-yellow-800', icon: '⚠️' },
      outOfStock: { color: 'bg-red-100 text-red-800', icon: '❌' },
      
      // Default
      default: { color: 'bg-gray-100 text-gray-800', icon: '📋' }
    };

    return configs[status] || configs.default;
  };

  const getSizeClasses = (size) => {
    const sizes = {
      xs: 'px-1.5 py-0.5 text-xs',
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
      lg: 'px-4 py-2 text-base'
    };
    return sizes[size] || sizes.sm;
  };

  const config = getStatusConfig(status, type);
  const sizeClasses = getSizeClasses(size);

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${config.color} ${sizeClasses} ${className}`}>
      <span className="text-xs">{config.icon}</span>
      <span className="capitalize">{status}</span>
    </span>
  );
};

export default StatusBadge;

