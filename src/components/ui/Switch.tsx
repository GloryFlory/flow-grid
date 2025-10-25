"use client"
import React from 'react'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  id?: string
}

export function Switch({ checked, onChange, id }: SwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`w-10 h-6 rounded-full p-1 transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
    >
      <span className={`block bg-white w-4 h-4 rounded-full transform transition-transform ${checked ? 'translate-x-4' : ''}`} />
    </button>
  )
}

export default Switch
