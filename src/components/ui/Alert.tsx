'use client';

import React from 'react';

interface AlertProps {
  type?: 'error' | 'success' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Alert({
  type = 'info',
  title,
  children,
  className = '',
}: AlertProps) {
  const typeStyles = {
    error: 'border-red-200 bg-red-50 text-red-600',
    success: 'border-green-200 bg-green-50 text-green-600',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-600',
    info: 'border-blue-200 bg-blue-50 text-blue-600',
  };

  return (
    <div className={`rounded-lg border-l-4 p-4 ${typeStyles[type]} ${className}`}>
      {title && <h4 className="font-semibold">{title}</h4>}
      <p className="text-sm">{children}</p>
    </div>
  );
}
