'use client';

import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export default function Input({
  label,
  error,
  hint,
  id,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-lg border-2 ${
          error ? 'border-red-500' : 'border-gray-200'
        } bg-white px-4 py-2.5 text-base text-gray-900 transition-colors placeholder:text-gray-500 focus:border-sakura-600 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {hint && <p className="text-sm text-gray-500">{hint}</p>}
    </div>
  );
}
