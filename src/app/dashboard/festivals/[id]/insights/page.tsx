'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Calendar, 
  Clock, 
  Layers, 
  MapPin, 
  BarChart3, 
  Loader2, 
  ArrowLeft,
  Ticket,
  GraduationCap,
  Eye
} from 'lucide-react'
import Link from 'next/link'

interface Festival {
  id: string
  name: string
  slug: string
}

interface InsightsData {
  summary: {
    totalSessions: number
    uniqueTeachers: number
    uniqueStyles: number
    uniqueDays: number
    uniqueLocations: number
    totalHours: number
    avgDuration: number
    totalBookings: number
    sessionsWithBookings: number
  }
  byTeacher: Array<{ name: string; count: number; hours: number; sessions: string[] }>
  byStyle: Array<{ style: string; count: number }>
  byLevel: Array<{ level: string; count: number }>
  byDay: Array<{ day: string; count: number }>
  byLocation: Array<{ location: string; count: number }>
}

const LEVEL_COLORS: Record<string, { bg: string; fill: string }> = {
  'Beginner': { bg: 'bg-green-500', fill: '#22c55e' },
  'Intermediate': { bg: 'bg-yellow-500', fill: '#eab308' },
  'Advanced': { bg: 'bg-red-500', fill: '#ef4444' },
  'All Levels': { bg: 'bg-blue-500', fill: '#3b82f6' },
  'Not specified': { bg: 'bg-gray-400', fill: '#9ca3af' },
}

const STYLE_COLORS = [
  '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', 
  '#ef4444', '#6366f1', '#14b8a6', '#f97316', '#84cc16'
]

// Tooltip component
function ChartTooltip({ 
  x, 
  y, 
  label, 
  value, 
  total, 
  color 
}: { 
  x: number
  y: number
  label: string
  value: number
  total: number
  color: string
}) {
  const percentage = Math.round((value / total) * 100)
  
  return (
    <div 
      className="absolute z-50 pointer-events-none bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap transform -translate-x-1/2 -translate-y-full"
      style={{ left: x, top: y - 8 }}
    >
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <span className="font-medium">{label}</span>
      </div>
      <div className="text-gray-300 mt-1">
        {value} session{value !== 1 ? 's' : ''} ({percentage}%)
      </div>
      {/* Arrow */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-900" />
    </div>
  )
}

// Simple Pie Chart component using SVG with tooltips
function PieChartComponent({ 
  data, 
  colors,
  size = 160 
}: { 
  data: Array<{ label: string; value: number }>
  colors: string[]
  size?: number
}) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; value: number; color: string } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const total = data.reduce((sum, d) => sum + d.value, 0)
  if (total === 0) return null
  
  let currentAngle = -90 // Start from top
  const radius = size / 2 - 10
  const center = size / 2

  const handleMouseEnter = (e: React.MouseEvent, label: string, value: number, color: string) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        label,
        value,
        color
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (tooltip && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setTooltip(prev => prev ? {
        ...prev,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      } : null)
    }
  }

  const slices = data.map((d, i) => {
    const percentage = d.value / total
    const angle = percentage * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle = endAngle

    // Calculate arc path
    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180
    const x1 = center + radius * Math.cos(startRad)
    const y1 = center + radius * Math.sin(startRad)
    const x2 = center + radius * Math.cos(endRad)
    const y2 = center + radius * Math.sin(endRad)
    const largeArc = angle > 180 ? 1 : 0

    const pathData = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ')

    return (
      <path
        key={i}
        d={pathData}
        fill={colors[i % colors.length]}
        stroke="white"
        strokeWidth="2"
        className="transition-all duration-200 cursor-pointer hover:opacity-80"
        style={{ filter: tooltip?.label === d.label ? 'brightness(1.1)' : undefined }}
        onMouseEnter={(e) => handleMouseEnter(e, d.label, d.value, colors[i % colors.length])}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      />
    )
  })

  return (
    <div ref={containerRef} className="relative">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices}
      </svg>
      {tooltip && (
        <ChartTooltip 
          x={tooltip.x} 
          y={tooltip.y} 
          label={tooltip.label} 
          value={tooltip.value} 
          total={total}
          color={tooltip.color}
        />
      )}
    </div>
  )
}

// Donut Chart component with tooltips
function DonutChartComponent({ 
  data, 
  colors,
  size = 160,
  thickness = 30
}: { 
  data: Array<{ label: string; value: number }>
  colors: string[]
  size?: number
  thickness?: number
}) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; value: number; color: string } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const total = data.reduce((sum, d) => sum + d.value, 0)
  if (total === 0) return null
  
  const radius = size / 2 - 10
  const innerRadius = radius - thickness
  const center = size / 2
  let currentAngle = -90

  const handleMouseEnter = (e: React.MouseEvent, label: string, value: number, color: string) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        label,
        value,
        color
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (tooltip && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setTooltip(prev => prev ? {
        ...prev,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      } : null)
    }
  }

  const slices = data.map((d, i) => {
    const percentage = d.value / total
    const angle = percentage * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle = endAngle

    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180
    
    const x1 = center + radius * Math.cos(startRad)
    const y1 = center + radius * Math.sin(startRad)
    const x2 = center + radius * Math.cos(endRad)
    const y2 = center + radius * Math.sin(endRad)
    const x3 = center + innerRadius * Math.cos(endRad)
    const y3 = center + innerRadius * Math.sin(endRad)
    const x4 = center + innerRadius * Math.cos(startRad)
    const y4 = center + innerRadius * Math.sin(startRad)
    
    const largeArc = angle > 180 ? 1 : 0

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
      'Z'
    ].join(' ')

    return (
      <path
        key={i}
        d={pathData}
        fill={colors[i % colors.length]}
        stroke="white"
        strokeWidth="2"
        className="transition-all duration-200 cursor-pointer hover:opacity-80"
        style={{ filter: tooltip?.label === d.label ? 'brightness(1.1)' : undefined }}
        onMouseEnter={(e) => handleMouseEnter(e, d.label, d.value, colors[i % colors.length])}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      />
    )
  })

  return (
    <div ref={containerRef} className="relative">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices}
        {/* Center text */}
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-2xl font-bold fill-gray-700"
        >
          {total}
        </text>
      </svg>
      {tooltip && (
        <ChartTooltip 
          x={tooltip.x} 
          y={tooltip.y} 
          label={tooltip.label} 
          value={tooltip.value} 
          total={total}
          color={tooltip.color}
        />
      )}
    </div>
  )
}

// Teacher Chart with expandable view and user-selectable display mode
function TeacherChart({ 
  byTeacher, 
  maxTeacherCount,
  summary 
}: { 
  byTeacher: Array<{ name: string; count: number; hours: number; sessions: string[] }>
  maxTeacherCount: number
  summary: { uniqueTeachers: number; totalHours: number }
}) {
  const [showAll, setShowAll] = useState(false)
  const [viewMode, setViewMode] = useState<'bars' | 'grid'>('bars')
  
  const INITIAL_SHOW = 8
  const hasMany = byTeacher.length > INITIAL_SHOW
  const displayedTeachers = showAll ? byTeacher : byTeacher.slice(0, INITIAL_SHOW)
  
  // Calculate stats for summary
  const avgSessionsPerTeacher = byTeacher.length > 0 
    ? (byTeacher.reduce((sum, t) => sum + t.count, 0) / byTeacher.length).toFixed(1)
    : 0
  const topTeacher = byTeacher[0]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-green-600" />
              Sessions by Teacher
            </CardTitle>
            <CardDescription>
              {summary.uniqueTeachers} teacher{summary.uniqueTeachers !== 1 ? 's' : ''} • {summary.totalHours} total hours
            </CardDescription>
          </div>
          {/* Always show view toggle when there are 2+ teachers */}
          {byTeacher.length >= 2 && (
            <div className="flex gap-1 border rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('bars')}
                className={`p-1.5 rounded ${viewMode === 'bars' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                title="Bar chart view"
              >
                <BarChart3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                title="Grid view"
              >
                <Layers className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {byTeacher.length === 0 ? (
          <p className="text-muted-foreground text-sm">No teacher data available</p>
        ) : (
          <>
            {/* Quick stats for many teachers */}
            {hasMany && (
              <div className="flex gap-4 mb-4 p-3 bg-gray-50 rounded-lg text-sm">
                <div>
                  <span className="text-muted-foreground">Top teacher:</span>{' '}
                  <span className="font-medium">{topTeacher?.name}</span>
                  <span className="text-muted-foreground"> ({topTeacher?.count} sessions)</span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-muted-foreground">Avg per teacher:</span>{' '}
                  <span className="font-medium">{avgSessionsPerTeacher}</span>
                </div>
              </div>
            )}

            {viewMode === 'bars' ? (
              <div className={`space-y-3 ${hasMany ? 'max-h-96 overflow-y-auto pr-2' : ''}`}>
                {displayedTeachers.map((teacher, index) => (
                  <div key={teacher.name} className="space-y-1 group">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium truncate flex-1 mr-2">
                        <span className="text-muted-foreground mr-2">#{index + 1}</span>
                        {teacher.name}
                      </span>
                      <span className="text-muted-foreground whitespace-nowrap">
                        {teacher.count} session{teacher.count !== 1 ? 's' : ''} • {teacher.hours}h
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full transition-all duration-500 group-hover:bg-green-600"
                        style={{ width: `${(teacher.count / maxTeacherCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Grid view for many teachers */
              <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2 ${showAll ? 'max-h-96 overflow-y-auto pr-2' : ''}`}>
                {displayedTeachers.map((teacher, index) => (
                  <div 
                    key={teacher.name} 
                    className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="font-medium text-sm truncate" title={teacher.name}>
                      {teacher.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {teacher.count} session{teacher.count !== 1 ? 's' : ''} • {teacher.hours}h
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Show more/less button */}
            {hasMany && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="mt-4 w-full py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                {showAll ? (
                  <>Show less</>
                ) : (
                  <>Show all {byTeacher.length} teachers</>
                )}
              </button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Session Type Chart with collapsible legend for many types
function SessionTypeChart({ 
  byStyle, 
  stylePieData,
  summary 
}: { 
  byStyle: Array<{ style: string; count: number }>
  stylePieData: Array<{ label: string; value: number }>
  summary: { uniqueStyles: number }
}) {
  const [showAll, setShowAll] = useState(false)
  const INITIAL_SHOW = 8
  const hasMany = byStyle.length > INITIAL_SHOW
  const displayedStyles = showAll ? byStyle : byStyle.slice(0, INITIAL_SHOW)
  
  // For chart, always show all data, but limit legend
  const topStyle = byStyle[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Layers className="h-5 w-5 text-purple-600" />
          Sessions by Type
        </CardTitle>
        <CardDescription>
          {summary.uniqueStyles} different session type{summary.uniqueStyles !== 1 ? 's' : ''}
          {hasMany && topStyle && (
            <span className="ml-2">• Top: {topStyle.style} ({topStyle.count})</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {byStyle.length === 0 ? (
          <p className="text-muted-foreground text-sm">No type data available</p>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <DonutChartComponent 
                data={stylePieData} 
                colors={STYLE_COLORS}
                size={160}
                thickness={35}
              />
            </div>
            <div className="flex-1">
              <div className={`grid grid-cols-2 gap-2 ${hasMany && showAll ? 'max-h-48 overflow-y-auto pr-2' : ''}`}>
                {displayedStyles.map((style, i) => (
                  <div key={style.style} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: STYLE_COLORS[i % STYLE_COLORS.length] }}
                    />
                    <span className="truncate flex-1">{style.style}</span>
                    <span className="text-muted-foreground">{style.count}</span>
                  </div>
                ))}
              </div>
              {hasMany && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="mt-3 w-full py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  {showAll ? 'Show less' : `Show all ${byStyle.length} types`}
                </button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Location Chart with collapsible grid for many locations
function LocationChart({ 
  byLocation, 
  summary 
}: { 
  byLocation: Array<{ location: string; count: number }>
  summary: { uniqueLocations: number }
}) {
  const [showAll, setShowAll] = useState(false)
  const INITIAL_SHOW = 9 // 3 columns x 3 rows
  const hasMany = byLocation.length > INITIAL_SHOW
  const displayedLocations = showAll ? byLocation : byLocation.slice(0, INITIAL_SHOW)
  
  const topLocation = byLocation[0]

  if (byLocation.length === 0 || byLocation[0].location === 'Not specified') {
    return null
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-red-600" />
          Sessions by Location
        </CardTitle>
        <CardDescription>
          {summary.uniqueLocations} different room{summary.uniqueLocations !== 1 ? 's' : ''}/location{summary.uniqueLocations !== 1 ? 's' : ''}
          {hasMany && topLocation && (
            <span className="ml-2">• Busiest: {topLocation.location} ({topLocation.count} sessions)</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`grid sm:grid-cols-2 md:grid-cols-3 gap-3 ${hasMany && showAll ? 'max-h-64 overflow-y-auto pr-2' : ''}`}>
          {displayedLocations.map((loc, index) => (
            <div key={loc.location} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="font-medium truncate flex-1 mr-2">
                {hasMany && <span className="text-muted-foreground mr-1.5">#{index + 1}</span>}
                {loc.location}
              </span>
              <span className="text-muted-foreground text-sm whitespace-nowrap">
                {loc.count}
              </span>
            </div>
          ))}
        </div>
        {hasMany && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-4 w-full py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
          >
            {showAll ? 'Show less' : `Show all ${byLocation.length} locations`}
          </button>
        )}
      </CardContent>
    </Card>
  )
}

export default function InsightsPage() {
  const params = useParams()
  const festivalId = params.id as string
  const [festival, setFestival] = useState<Festival | null>(null)
  const [data, setData] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [insightsRes, festivalRes] = await Promise.all([
          fetch(`/api/admin/festivals/${festivalId}/insights`),
          fetch(`/api/admin/festivals/${festivalId}`)
        ])
        
        if (!insightsRes.ok) throw new Error('Failed to fetch insights')
        if (!festivalRes.ok) throw new Error('Failed to fetch festival')
        
        const insightsJson = await insightsRes.json()
        const festivalJson = await festivalRes.json()
        
        setData(insightsJson)
        setFestival(festivalJson.festival)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [festivalId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto" />
          <p className="text-gray-600 mt-2">Loading insights...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="border-destructive max-w-md">
          <CardContent className="pt-6">
            <p className="text-destructive">Error: {error}</p>
            <Link href={`/dashboard/festivals/${festivalId}`}>
              <Button className="mt-4">Back to Event</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data || !festival) return null

  const { summary, byTeacher, byStyle, byLevel, byDay, byLocation } = data

  // Calculate max for bar scaling
  const maxTeacherCount = Math.max(...byTeacher.map(t => t.count), 1)
  const maxDayCount = Math.max(...byDay.map(d => d.count), 1)
  const totalLevelCount = byLevel.reduce((a, b) => a + b.count, 0) || 1

  const metrics = [
    { label: 'Total Sessions', value: summary.totalSessions, icon: Calendar, color: 'text-blue-600' },
    { label: 'Unique Teachers', value: summary.uniqueTeachers, icon: Users, color: 'text-green-600' },
    { label: 'Session Types', value: summary.uniqueStyles, icon: Layers, color: 'text-purple-600' },
    { label: 'Event Days', value: summary.uniqueDays, icon: BarChart3, color: 'text-orange-600' },
    { label: 'Total Hours', value: summary.totalHours, icon: Clock, color: 'text-indigo-600', suffix: 'hrs' },
    { label: 'Avg Duration', value: summary.avgDuration, icon: Clock, color: 'text-pink-600', suffix: 'min' },
  ]

  // Prepare pie chart data
  const levelPieData = byLevel.map(l => ({ label: l.level, value: l.count }))
  const levelColors = byLevel.map(l => LEVEL_COLORS[l.level]?.fill || '#9ca3af')
  
  const stylePieData = byStyle.map(s => ({ label: s.style, value: s.count }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Mobile: Back button on its own row */}
          <div className="mb-3 sm:hidden">
            <Link href={`/dashboard/festivals/${festival.id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Event
              </Button>
            </Link>
          </div>
          
          {/* Main header content */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
            <div className="flex items-start gap-4 min-w-0 flex-1">
              <div className="hidden sm:block flex-shrink-0">
                <Link href={`/dashboard/festivals/${festival.id}`}>
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Event
                  </Button>
                </Link>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">Event Insights</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1 truncate">Workshop & content breakdown</p>
              </div>
            </div>
            
            <div className="flex gap-2 flex-shrink-0">
              <Link href={`/dashboard/festivals/${festival.id}/analytics`}>
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Visitor Analytics</span>
                </Button>
              </Link>
              <Link href={`/${festival.slug}/schedule`} target="_blank">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">View Live</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {metrics.map((metric) => (
            <Card key={metric.label}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                  <div>
                    <p className="text-2xl font-bold">
                      {metric.value.toLocaleString()}{metric.suffix && <span className="text-sm font-normal text-muted-foreground ml-1">{metric.suffix}</span>}
                    </p>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Booking Stats (if any) */}
        {summary.sessionsWithBookings > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Ticket className="h-5 w-5 text-orange-600" />
                Booking Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-8">
                <div>
                  <p className="text-3xl font-bold text-orange-600">{summary.totalBookings}</p>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600">{summary.sessionsWithBookings}</p>
                  <p className="text-sm text-muted-foreground">Bookable Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* By Teacher - Bar chart */}
          <TeacherChart 
            byTeacher={byTeacher} 
            maxTeacherCount={maxTeacherCount}
            summary={summary}
          />

          {/* By Style - Donut chart */}
          <SessionTypeChart 
            byStyle={byStyle}
            stylePieData={stylePieData}
            summary={summary}
          />

          {/* By Level - Pie chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                Sessions by Level
              </CardTitle>
              <CardDescription>
                Skill level distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              {byLevel.length === 0 ? (
                <p className="text-muted-foreground text-sm">No level data available</p>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="flex-shrink-0">
                    <PieChartComponent 
                      data={levelPieData} 
                      colors={levelColors}
                      size={160}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    {byLevel.map((level) => (
                      <div key={level.level} className="flex items-center gap-2 text-sm">
                        <div className={`w-3 h-3 rounded-full ${LEVEL_COLORS[level.level]?.bg || 'bg-gray-400'}`} />
                        <span className="flex-1">{level.level}</span>
                        <span className="font-medium">{level.count}</span>
                        <span className="text-muted-foreground text-xs w-12 text-right">
                          {Math.round((level.count / totalLevelCount) * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* By Day - Bar chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
                Sessions by Day
              </CardTitle>
              <CardDescription>
                {summary.uniqueDays} festival day{summary.uniqueDays !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {byDay.length === 0 ? (
                <p className="text-muted-foreground text-sm">No schedule data available</p>
              ) : (
                <div className="space-y-3">
                  {byDay.map((day) => {
                    const dateObj = new Date(day.day)
                    const formattedDay = !isNaN(dateObj.getTime()) 
                      ? dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                      : day.day
                    
                    return (
                      <div key={day.day} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{formattedDay}</span>
                          <span className="text-muted-foreground">
                            {day.count} session{day.count !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-orange-500 rounded-full transition-all duration-500"
                            style={{ width: `${(day.count / maxDayCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* By Location */}
          <LocationChart 
            byLocation={byLocation}
            summary={summary}
          />
        </div>
      </div>
    </div>
  )
}
