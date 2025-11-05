'use client'
import React, { useState } from 'react'

interface FilterBarProps {
  levelFilter: string
  setLevelFilter: (level: string) => void
  styleFilter: string
  setStyleFilter: (style: string) => void
  searchFilter: string
  setSearchFilter: (search: string) => void
  teacherFilter: string
  setTeacherFilter: (teacher: string) => void
  availableLevels: string[]
  availableStyles: string[]
  availableTeachers: string[]
}

export function FilterBar({
  levelFilter,
  setLevelFilter,
  styleFilter,
  setStyleFilter,
  searchFilter,
  setSearchFilter,
  teacherFilter,
  setTeacherFilter,
  availableLevels,
  availableStyles,
  availableTeachers
}: FilterBarProps) {
  const [filtersOpen, setFiltersOpen] = useState(true) // Changed: Open by default for better discoverability
  
  const clearAllFilters = () => {
    setLevelFilter('')
    setStyleFilter('')
    setSearchFilter('')
    setTeacherFilter('')
  }

  const hasActiveFilters = levelFilter || styleFilter || searchFilter || teacherFilter

  return (
    <div className="filter-container">
      {/* Mobile: Collapsible filter toggle */}
      <div className="mobile-filter-toggle">
        <button 
          className="filters-toggle-btn"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <span>Filters</span>
          {hasActiveFilters && <span className="active-indicator">●</span>}
          <span className={`toggle-arrow ${filtersOpen ? 'open' : ''}`}>▼</span>
        </button>
      </div>

      {/* Filter content - collapsible on mobile */}
      <div className={`filter-bar ${filtersOpen ? 'mobile-open' : ''}`}>
        <div className="filter-group">
          <label>Search:</label>
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search sessions..."
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <label>Level:</label>
          <select 
            value={levelFilter} 
            onChange={(e) => setLevelFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Levels</option>
            {availableLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>Style:</label>
          <select 
            value={styleFilter} 
            onChange={(e) => setStyleFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Styles</option>
            {availableStyles.map(style => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>Teacher:</label>
          <select 
            value={teacherFilter} 
            onChange={(e) => setTeacherFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Teachers</option>
            {availableTeachers.map(teacher => (
              <option key={teacher} value={teacher}>{teacher}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <button 
            onClick={clearAllFilters}
            className={`clear-filters-btn ${hasActiveFilters ? 'active' : ''}`}
            disabled={!hasActiveFilters}
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  )
}