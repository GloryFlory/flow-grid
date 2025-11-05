'use client'
import React, { useEffect, useRef, useState } from 'react'

interface SimpleSelectProps {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder: string
  ariaLabel?: string
}

export default function SimpleSelect({ value, onChange, options, placeholder, ariaLabel }: SimpleSelectProps) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLUListElement | null>(null)

  // Close on outside click / escape
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return
      const t = e.target as Node
      if (triggerRef.current?.contains(t)) return
      if (menuRef.current?.contains(t)) return
      setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const current = value || ''

  return (
    <div className="simple-select">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className="simple-select-trigger"
        onClick={() => setOpen((o) => !o)}
      >
        <span className={`simple-select-value ${current ? '' : 'placeholder'}`}>
          {current || placeholder}
        </span>
        <span className="simple-select-chevron">▾</span>
      </button>

      {open && (
        <ul ref={menuRef} className="simple-select-menu" role="listbox">
          <li
            role="option"
            aria-selected={current === ''}
            className={`simple-select-option ${current === '' ? 'selected' : ''}`}
            onClick={() => {
              onChange('')
              setOpen(false)
            }}
          >
            {placeholder}
          </li>
          {options.map((opt) => (
            <li
              key={opt}
              role="option"
              aria-selected={current === opt}
              className={`simple-select-option ${current === opt ? 'selected' : ''}`}
              onClick={() => {
                onChange(opt)
                setOpen(false)
              }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
