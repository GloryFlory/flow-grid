"use client"
import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input(props: InputProps) {
  const { label, className = '', ...rest } = props
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input {...rest} className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${className}`} />
    </div>
  )
}

export default Input
