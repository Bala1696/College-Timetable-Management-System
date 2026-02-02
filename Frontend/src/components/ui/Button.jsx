import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    className = '',
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

    const variants = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/30 focus:ring-primary-500 border border-transparent',
        secondary: 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm focus:ring-gray-200',
        outline: 'bg-transparent border border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
        ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent shadow-none',
        danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/30 focus:ring-red-500 border border-transparent',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
        icon: 'p-2',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                </>
            ) : children}
        </button>
    );
};

export default Button;
