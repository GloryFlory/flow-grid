/**
 * Google Sheets Utility Functions
 * Handles fetching and parsing data from publicly shared Google Sheets
 */

export interface ParsedSession {
  id?: string
  day: string
  start: string
  end: string
  title: string
  level?: string
  capacity?: number
  types?: string
  cardType?: 'minimal' | 'photo' | 'detailed'
  teachers?: string
  location?: string
  description?: string
  prerequisites?: string
}

export interface GoogleSheetValidationResult {
  isValid: boolean
  error?: string
  sessions?: ParsedSession[]
}

/**
 * Extract the spreadsheet ID from a Google Sheets URL
 */
export function extractSheetId(url: string): string | null {
  try {
    // Match patterns like:
    // https://docs.google.com/spreadsheets/d/SHEET_ID/edit
    // https://docs.google.com/spreadsheets/d/SHEET_ID/edit#gid=0
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
    return match ? match[1] : null
  } catch (error) {
    return null
  }
}

/**
 * Validate that a Google Sheets URL is publicly accessible
 */
export async function validateGoogleSheetUrl(url: string): Promise<{ isValid: boolean; error?: string; sheetId?: string }> {
  const sheetId = extractSheetId(url)
  
  if (!sheetId) {
    return {
      isValid: false,
      error: 'Invalid Google Sheets URL. Please provide a valid URL like: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit'
    }
  }

  // Try to fetch the sheet as CSV to verify it's publicly accessible
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`
  
  try {
    const response = await fetch(csvUrl)
    
    if (!response.ok) {
      if (response.status === 404) {
        return {
          isValid: false,
          error: 'Sheet not found. Please check the URL is correct.'
        }
      }
      if (response.status === 403) {
        return {
          isValid: false,
          error: 'Sheet is not publicly accessible. Please share the sheet with "Anyone with the link" can view.'
        }
      }
      return {
        isValid: false,
        error: `Unable to access sheet (HTTP ${response.status}). Please ensure it's publicly shared.`
      }
    }

    return {
      isValid: true,
      sheetId
    }
  } catch (error) {
    return {
      isValid: false,
      error: 'Network error. Please check your internet connection and try again.'
    }
  }
}

/**
 * Fetch and parse Google Sheets data
 */
export async function fetchGoogleSheetData(sheetId: string): Promise<GoogleSheetValidationResult> {
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`
  
  try {
    const response = await fetch(csvUrl)
    
    if (!response.ok) {
      return {
        isValid: false,
        error: `Failed to fetch sheet data (HTTP ${response.status})`
      }
    }

    const csvText = await response.text()
    return parseGoogleSheetCsv(csvText)
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Failed to fetch sheet data'
    }
  }
}

/**
 * Parse CSV text from Google Sheets into session objects
 */
export function parseGoogleSheetCsv(csvText: string): GoogleSheetValidationResult {
  try {
    const lines = csvText.trim().split('\n')
    
    if (lines.length < 2) {
      return {
        isValid: false,
        error: 'Sheet appears to be empty or has no data rows'
      }
    }

    // Parse header row
    const headers = lines[0].split(/[,;]/).map(h => h.trim().replace(/^"|"$/g, ''))
    
    // Validate required columns
    const requiredColumns = ['title', 'day', 'start', 'end']
    const missingColumns = requiredColumns.filter(col => 
      !headers.some(h => h.toLowerCase() === col.toLowerCase())
    )
    
    if (missingColumns.length > 0) {
      return {
        isValid: false,
        error: `Missing required columns: ${missingColumns.join(', ')}. Required: title, day, start, end`
      }
    }

    // Create column index map (case-insensitive)
    const columnMap: { [key: string]: number } = {}
    headers.forEach((header, index) => {
      const key = header.toLowerCase()
      columnMap[key] = index
    })

    // Parse data rows
    const sessions: ParsedSession[] = []
    const errors: string[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Simple CSV parsing (handles quoted fields)
      const values: string[] = []
      let current = ''
      let inQuotes = false

      for (let j = 0; j < line.length; j++) {
        const char = line[j]
        const delimiter = line.includes(';') ? ';' : ','

        if (char === '"') {
          inQuotes = !inQuotes
        } else if ((char === delimiter) && !inQuotes) {
          values.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      values.push(current.trim()) // Don't forget the last value

      // Get values by column name (case-insensitive)
      const getValue = (columnName: string): string => {
        const index = columnMap[columnName.toLowerCase()]
        return index !== undefined ? values[index]?.replace(/^"|"$/g, '') || '' : ''
      }

      const title = getValue('title')
      const day = getValue('day')
      const start = getValue('start')
      const end = getValue('end')

      // Validate required fields
      if (!title || !day || !start || !end) {
        errors.push(`Row ${i + 1}: Missing required fields (title="${title}", day="${day}", start="${start}", end="${end}")`)
        continue
      }

      // Validate CardType
      const cardTypeRaw = getValue('CardType') || getValue('cardtype')
      const cardType = cardTypeRaw.toLowerCase().trim()
      if (cardType && !['minimal', 'photo', 'detailed', ''].includes(cardType)) {
        errors.push(`Row ${i + 1}: Invalid CardType "${cardTypeRaw}". Must be "minimal", "photo", or "detailed"`)
      }

      const capacityStr = getValue('capacity')
      const capacity = capacityStr ? parseInt(capacityStr, 10) : undefined

      sessions.push({
        id: getValue('id') || `session-${i}`,
        day,
        start,
        end,
        title,
        level: getValue('level'),
        capacity: capacity && !isNaN(capacity) ? capacity : undefined,
        types: getValue('types'),
        cardType: (cardType as 'minimal' | 'photo' | 'detailed') || 'detailed',
        teachers: getValue('teachers'),
        location: getValue('location'),
        description: getValue('Description') || getValue('description'),
        prerequisites: getValue('Prerequisites') || getValue('prerequisites')
      })
    }

    if (sessions.length === 0) {
      return {
        isValid: false,
        error: errors.length > 0 
          ? `No valid sessions found. Errors: ${errors.join('; ')}` 
          : 'No valid sessions found in the sheet'
      }
    }

    return {
      isValid: true,
      sessions,
      error: errors.length > 0 ? `Imported ${sessions.length} sessions with ${errors.length} errors: ${errors.join('; ')}` : undefined
    }
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? `Parse error: ${error.message}` : 'Failed to parse sheet data'
    }
  }
}
