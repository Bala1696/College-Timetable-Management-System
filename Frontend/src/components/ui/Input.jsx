import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    ref={ref}
                    className={`
            w-full px-4 py-2 bg-white border border-gray-200 rounded-lg 
            text-gray-900 placeholder-gray-400
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
            hover:border-gray-300
            disabled:bg-gray-50 disabled:text-gray-500
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}
          `}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 text-xs text-red-500 animate-slide-up">
                    {error}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
