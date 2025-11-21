// Test the exact sorting logic we're using in production
const testSessions = [
  // Mix of formats to test
  { id: 1, title: "Wed Arrival", day: "2025-11-12", startTime: "2025-11-12T14:00:00", displayOrder: 0 },
  { id: 2, title: "Thu Morning", day: "2025-11-13", startTime: "07:00", displayOrder: 0 },
  { id: 3, title: "Fri Morning", day: "Friday", startTime: "2025-11-14T07:00:00", displayOrder: 0 },
  { id: 4, title: "Sat Afternoon", day: "Saturday", startTime: "2025-11-15T14:00:00", displayOrder: 0 },
  { id: 5, title: "Sun Morning", day: "Sunday", startTime: "2025-11-16T09:00:00", displayOrder: 0 },
  { id: 6, title: "Fri Afternoon", day: "2025-11-14", startTime: "14:00", displayOrder: 0 },
]

// THE EXACT SORTING LOGIC FROM OUR API
const getFullDateTime = (session) => {
  if (session.startTime && session.startTime.includes('T')) {
    return session.startTime // e.g., "2025-11-14T07:00:00"
  }
  // Combine day field (date) with startTime (time only)
  if (session.day && session.startTime) {
    return `${session.day}T${session.startTime}:00` // e.g., "2025-11-14T09:00:00"
  }
  // Fallback to just the day if no startTime
  return session.day || ''
}

const sorted = testSessions.sort((a, b) => {
  const dateTimeA = getFullDateTime(a)
  const dateTimeB = getFullDateTime(b)
  
  // Primary sort: by full datetime (includes both date and time)
  if (dateTimeA !== dateTimeB) {
    return dateTimeA.localeCompare(dateTimeB)
  }
  
  // Tertiary: displayOrder (for parallel sessions at same time)
  const orderA = a.displayOrder !== null && a.displayOrder !== undefined ? Number(a.displayOrder) : 999999
  const orderB = b.displayOrder !== null && b.displayOrder !== undefined ? Number(b.displayOrder) : 999999
  return orderA - orderB
})

console.log('\n=== SORTING TEST RESULTS ===\n')
console.log('Input (mixed formats):')
testSessions.forEach(s => console.log(`  ${s.title.padEnd(20)} | day: ${(s.day || '').padEnd(12)} | startTime: ${s.startTime}`))

console.log('\nExpected order:')
console.log('  1. Wed Arrival (2025-11-12 14:00)')
console.log('  2. Thu Morning (2025-11-13 07:00)')
console.log('  3. Fri Morning (2025-11-14 07:00)')
console.log('  4. Fri Afternoon (2025-11-14 14:00)')
console.log('  5. Sat Afternoon (2025-11-15 14:00)')
console.log('  6. Sun Morning (2025-11-16 09:00)')

console.log('\nActual sorted output:')
sorted.forEach((s, i) => {
  const dt = getFullDateTime(s)
  console.log(`  ${i+1}. ${s.title.padEnd(20)} → ${dt}`)
})

// Verify correctness
const expectedOrder = [
  "Wed Arrival",
  "Thu Morning", 
  "Fri Morning",
  "Fri Afternoon",
  "Sat Afternoon",
  "Sun Morning"
]

const actualOrder = sorted.map(s => s.title)
const isCorrect = JSON.stringify(expectedOrder) === JSON.stringify(actualOrder)

console.log('\n=== TEST RESULT ===')
console.log(isCorrect ? '✅ SORTING IS CORRECT' : '❌ SORTING IS BROKEN')
if (!isCorrect) {
  console.log('\nExpected:', expectedOrder)
  console.log('Got:     ', actualOrder)
}

process.exit(isCorrect ? 0 : 1)
