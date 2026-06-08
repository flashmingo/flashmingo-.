'use client';

import React, { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { value: string; label: string }[];
}

export default function Select({
  label,
  error,
  options = [],
  id,
  className = '',
  ...props
}: SelectProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`w-full rounded-lg border-2 ${
          error ? 'border-red-500' : 'border-gray-200'
        } bg-white px-4 py-2.5 text-base text-gray-900 transition-colors focus:border-sakura-600 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
