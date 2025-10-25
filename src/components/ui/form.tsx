import React from 'react'

export const Label = ({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
)

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={(props.className || '') + ' rounded-md border px-2 py-1'} />
)

export const Switch = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`w-11 h-6 rounded-full p-1 transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}>
    <span
      className={`inline-block w-4 h-4 bg-white rounded-full transform transition-transform ${checked ? 'translate-x-5' : ''}`}
    />
  </button>
)
