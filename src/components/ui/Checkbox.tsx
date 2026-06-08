'use client';

import React, { InputHTMLAttributes } from 'react';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Checkbox({ label, id, className = '', ...props }: CheckboxProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id={id}
        className={`h-4 w-4 rounded border-2 border-gray-200 bg-white text-sakura-600 focus:ring-2 focus:ring-sakura-500 focus:ring-offset-2 disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
      {label && (
        <label htmlFor={id} className="text-sm text-gray-700 cursor-pointer">
          {label}
        </label>
      )}
    </div>
  );
}
