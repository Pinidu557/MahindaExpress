import React from 'react';

const AnimatedCard = ({ 
  children, 
  className = '', 
  hover = true,
  animation = 'scaleIn',
  delay = '0s',
  ...props 
}) => {
  const animationClasses = {
    fadeIn: 'animate-fadeIn',
    slideIn: 'animate-slideIn',
    scaleIn: 'animate-scaleIn'
  };

  const hoverClasses = hover ? 'hover-lift' : '';

  return (
    <div 
      className={`card ${hoverClasses} ${animationClasses[animation]} ${className}`}
      style={{ animationDelay: delay }}
      {...props}
    >
      {children}
    </div>
  );
};

export default AnimatedCard;

