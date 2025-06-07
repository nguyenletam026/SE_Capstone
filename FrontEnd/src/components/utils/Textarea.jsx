import React from 'react';

const Textarea = ({ 
  label,
  error,
  helperText,
  className = '',
  containerClassName = '',
  rows = 4,
  ...props 
}) => {
  const textareaClasses = `
    block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    resize-vertical
    ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
    ${className}
  `;

  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={textareaClasses}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Textarea;
