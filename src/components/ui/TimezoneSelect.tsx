'use client'
import React, { useEffect, useRef, useState } from 'react'
import { TIMEZONE_GROUPS, TimezoneGroup } from '@/lib/timezones'

interface TimezoneSelectProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}

export default function TimezoneSelect({ value, onChange, placeholder = 'Select timezone', className }: TimezoneSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const searchRef = useRef<HTMLInputElement | null>(null)

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

  // Focus search input when opened
  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus()
    }
  }, [open])

  // Find current label
  const currentLabel = React.useMemo(() => {
    for (const group of TIMEZONE_GROUPS) {
      const found = group.options.find(tz => tz.value === value)
      if (found) return found.label
    }
    return ''
  }, [value])

  // Filter groups based on search
  const filteredGroups = React.useMemo(() => {
    if (!search.trim()) return TIMEZONE_GROUPS
    
    const searchLower = search.toLowerCase()
    return TIMEZONE_GROUPS.map(group => ({
      ...group,
      options: group.options.filter(tz => 
        tz.label.toLowerCase().includes(searchLower) ||
        tz.value.toLowerCase().includes(searchLower)
      )
    })).filter(group => group.options.length > 0)
  }, [search])

  return (
    <div className={`relative ${className || ''}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
        onClick={() => setOpen((o) => !o)}
      >
        <span className={currentLabel ? 'text-gray-900' : 'text-gray-500'}>
          {currentLabel || placeholder}
        </span>
        <span className="text-gray-400">▾</span>
      </button>

      {open && (
        <div 
          ref={menuRef} 
          className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl border-t border-gray-200 max-h-[70vh] flex flex-col md:absolute md:inset-auto md:top-full md:left-0 md:right-0 md:bottom-auto md:mt-1 md:rounded-lg md:max-h-80"
          role="listbox"
        >
          {/* Header with search */}
          <div className="sticky top-0 bg-white border-b border-gray-100 p-3 rounded-t-2xl md:rounded-t-lg">
            <div className="flex items-center justify-between mb-2 md:hidden">
              <span className="font-semibold text-gray-900">Select Timezone</span>
              <button 
                type="button"
                onClick={() => setOpen(false)}
                className="text-blue-600 font-medium"
              >
                Done
              </button>
            </div>
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search timezones..."
              className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Options */}
          <div className="overflow-y-auto flex-1 overscroll-contain">
            {filteredGroups.map((group) => (
              <div key={group.label}>
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                  {group.label}
                </div>
                {group.options.map((tz) => (
                  <button
                    key={tz.value}
                    type="button"
                    role="option"
                    aria-selected={value === tz.value}
                    className={`w-full px-4 py-3 text-left text-base hover:bg-blue-50 flex items-center justify-between ${
                      value === tz.value ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                    }`}
                    onClick={() => {
                      onChange(tz.value)
                      setSearch('')
                      setOpen(false)
                    }}
                  >
                    <span>{tz.label}</span>
                    {value === tz.value && (
                      <span className="text-blue-600">✓</span>
                    )}
                  </button>
                ))}
              </div>
            ))}
            
            {filteredGroups.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500">
                No timezones found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop for mobile */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  )
}
