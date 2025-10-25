// Test Supabase connection without Prisma
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rfpoqcliiduvotlfzopv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcG9xY2xpaWR1dm90bGZ6b3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1OTM3MDcsImV4cCI6MjA3NjE2OTcwN30.3TTof6rKWWDJ-Fzcs2wSLfTxxQnHPPWSFn-IJbYO8l4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase.from('_').select('*').limit(1)
    
    if (error && error.message.includes('relation "_" does not exist')) {
      console.log('✅ Supabase connection successful! (Table not found is expected)')
      return true
    } else if (error) {
      console.log('❌ Connection error:', error.message)
      return false
    } else {
      console.log('✅ Supabase connection successful!')
      return true
    }
  } catch (err) {
    console.log('❌ Connection failed:', err.message)
    return false
  }
}

testConnection()