'use client'
import React from 'react'

interface ScheduleTabsProps {
  days: string[]
  activeDay: string
  setActiveDay: (day: string) => void
}

export function ScheduleTabs({ days, activeDay, setActiveDay }: ScheduleTabsProps) {
  console.log('ScheduleTabs received days:', days)
  
  return (
    <div className="schedule-tabs">
      {days.map(day => (
        <button
          key={day}
          className={`tab ${activeDay === day ? 'active' : ''}`}
          onClick={() => setActiveDay(day)}
        >
          {day}
        </button>
      ))}
    </div>
  )
}