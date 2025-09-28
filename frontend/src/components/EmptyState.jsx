import React from 'react';

const EmptyState = ({ 
  icon = '📋', 
  title = 'No data found', 
  description = 'There are no items to display at the moment.',
  action = null,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      <div className="text-6xl mb-4 animate-bounce">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4 max-w-md">{description}</p>
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;

