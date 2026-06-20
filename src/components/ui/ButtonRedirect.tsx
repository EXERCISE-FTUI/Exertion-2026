"use client"
import { redirect } from 'next/navigation';
import { useState } from 'react';

interface ButtonRedirectProps {
    to: string;
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'outline' | 'ghost';
}

const ButtonRedirect = ({ 
    to, 
    children, 
    className = '', 
    variant = 'default' 
}: ButtonRedirectProps) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = () => {
        setIsLoading(true);
        redirect(to);
    };

    const baseStyles = "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
    const variantStyles = {
        default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
        outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
        ghost: "bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500"
    };

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            onClick={handleClick}
            disabled={isLoading}
        >
            {isLoading ? (
                <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Navigating...
                </span>
            ) : (
                children
            )}
        </button>
    );
};

export default ButtonRedirect;