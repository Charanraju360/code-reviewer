import React from 'react';
export const Button = ({ children, className = '', ...props }) => (
  <button className={`bg-blue-600 text-white py-2 px-4 rounded ${className}`} {...props}>
    {children}
  </button>
);
