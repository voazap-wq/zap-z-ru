
import React from 'react';
import { UseFormRegisterReturn, FieldError } from 'react-hook-form';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  register: UseFormRegisterReturn;
  error?: FieldError;
  helperText?: string;
}

const TextField: React.FC<TextFieldProps> = ({ id, label, register, error, helperText, type = 'text', ...props }) => {
  const commonInputStyles = "w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-200 dark:disabled:bg-gray-600";
  const errorTextStyles = "text-red-500 text-sm mt-1";
  const helperTextStyles = "text-xs text-gray-500 dark:text-gray-400 mt-1";
  
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        {...register}
        {...props}
        className={`${commonInputStyles} ${error ? 'border-red-500' : ''}`}
      />
      {error ? (
        <p className={errorTextStyles}>{error.message}</p>
      ) : helperText ? (
        <p className={helperTextStyles}>{helperText}</p>
      ) : null}
    </div>
  );
};

export default TextField;