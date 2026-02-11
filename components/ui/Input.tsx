import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  textarea?: boolean;
  rows?: number;
}

export const Input: React.FC<InputProps> = ({ label, error, textarea, rows = 3, className = '', ...props }) => {
  const baseClassName = `w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-blue-500 ${className}`;

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{label}</label>}
      {textarea ? (
        <textarea
          className={baseClassName}
          rows={rows}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          className={baseClassName}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};