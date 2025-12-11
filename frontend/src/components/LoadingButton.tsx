'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  children: React.ReactNode
}

export default function LoadingButton({ 
  loading = false, 
  children, 
  disabled,
  className = '',
  ...props 
}: LoadingButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        ${className}
        flex items-center justify-center gap-2
        px-4 py-2.5 rounded-lg font-semibold
        transition-all duration-200
        ${loading || disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:shadow-lg transform hover:scale-105'
        }
      `}
    >
      {loading && (
        <Loader2 className="h-4 w-4 animate-spin" />
      )}
      {children}
    </button>
  )
}


