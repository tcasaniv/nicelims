import React from 'react';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => {
  return (
    <div className={`rounded-lg border border-zinc-200 bg-white text-zinc-950 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => {
  return <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>{children}</div>;
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = '', ...props }) => {
  return <h3 className={`font-semibold leading-none tracking-tight ${className}`} {...props}>{children}</h3>;
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => {
  return <div className={`p-6 pt-0 ${className}`} {...props}>{children}</div>;
};