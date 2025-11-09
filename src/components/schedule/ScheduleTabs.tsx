'use client'
import React from 'react'

interface ScheduleTabsProps {
  days: string[]
  activeDay: string
  setActiveDay: (day: string) => void
  showDates?: boolean  // Show dates when there are duplicate day names
}

// Helper to format date string conditionally
const formatDayLabel = (dateStr: string, showDates: boolean): { main: string; sub?: string } => {
  if (dateStr === 'All Days') return { main: 'All Days' }
  
  try {
    // Parse YYYY-MM-DD as UTC to avoid timezone issues
    const date = new Date(dateStr + 'T12:00:00Z')
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })
    
    // Only show dates if requested (multi-week festivals)
    if (showDates) {
      const day = date.getUTCDate()
      const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
      return {
        main: dayName,
        sub: `${day} ${month}`  // e.g., "14 Nov"
      }
    }
    
    return { main: date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' }) }  // e.g., "Friday"
  } catch (e) {
    return { main: dateStr }
  }
}

export function ScheduleTabs({ days, activeDay, setActiveDay, showDates = false }: ScheduleTabsProps) {
  console.log('ScheduleTabs received days:', days, 'showDates:', showDates)
  
  return (
    <div className="schedule-tabs">
      {days.map((day, index) => {
        const label = formatDayLabel(day, showDates)
        return (
          <button
            key={`${day}-${index}`}
            className={`tab ${activeDay === day ? 'active' : ''} ${label.sub ? 'two-line' : ''}`}
            onClick={() => setActiveDay(day)}
          >
            <span className="tab-main">{label.main}</span>
            {label.sub && <span className="tab-sub">{label.sub}</span>}
          </button>
        )
      })}
    </div>
  )
}