import React from 'react';
export const Badge = ({ children, variant = 'default', className = '' }) => {
  const base = 'px-2 py-1 text-xs font-medium rounded';
  const variants = {
    default: 'bg-gray-200 text-gray-800',
    destructive: 'bg-red-600 text-white',
    outline: 'border border-gray-300 text-gray-800',
    secondary: 'bg-blue-100 text-blue-800',
  };
  return <span className={`${base} ${variants[variant] || variants.default} ${className}`}>{children}</span>;
};
