
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'contained' | 'outlined' | 'text';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant = 'contained', children, className = '', ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium tracking-wide uppercase transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-sm';
  
  const variantStyles = {
    contained: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary-light disabled:bg-gray-300 disabled:text-gray-500',
    outlined: 'border border-primary text-primary hover:bg-primary/10 focus:ring-primary-light disabled:border-gray-300 disabled:text-gray-400',
    text: 'text-primary hover:bg-primary/10 focus:ring-primary-light disabled:text-gray-400 shadow-none',
  };

  return (
    <button className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
