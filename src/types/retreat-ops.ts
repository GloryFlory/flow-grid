export type ImportSheetRole = 'BOOKINGS' | 'PARTICIPANTS'

export type ImportTransformType =
  | 'NONE'
  | 'TRIM'
  | 'LOWERCASE_EMAIL'
  | 'BOOLEAN_WE_TRAVEL'
  | 'CURRENCY'
  | 'INTEGER'
  | 'DATE'

export type ImportTargetEntity = 'BOOKING' | 'GUEST' | 'CUSTOM_ANSWER' | 'CUSTOM_CONSENT'

export interface ImportColumnMapping {
  sourceSheet: string
  sourceColumn: string
  targetEntity: ImportTargetEntity
  targetField: string
  transform: ImportTransformType
  required: boolean
}

export interface ImportSheetSelection {
  bookingsSheetName: string
  participantsSheetName: string
}

export interface ImportParseIssue {
  sheet: string
  rowNumber: number
  column?: string
  code: 'MISSING_REQUIRED' | 'INVALID_EMAIL' | 'INVALID_DATE' | 'INVALID_NUMBER' | 'UNKNOWN'
  message: string
}

export interface ImportRowPreview {
  rowNumber: number
  matchConfidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NEW'
  guestKey: string
  summary: Record<string, string | number | boolean | null>
}

export interface ImportPreviewRequest {
  eventId: string
  sheetSelection: ImportSheetSelection
  mappings: ImportColumnMapping[]
  workbookBase64: string
}

export interface ImportPreviewResponse {
  importJobId: string
  stats: {
    bookingRows: number
    participantRows: number
    matchedGuests: number
    newGuests: number
    lowConfidenceMatches: number
    issues: number
  }
  issues: ImportParseIssue[]
  rows: ImportRowPreview[]
}

export interface ImportCommitRequest {
  eventId: string
  importJobId: string
  applyRoomSignals: boolean
  overwriteExistingFields: boolean
}

export interface ImportCommitResponse {
  importedBookings: number
  importedGuests: number
  updatedGuests: number
  skippedRows: number
}

export type GuestPaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID'

export type GuestCheckInStatus = 'NOT_CHECKED_IN' | 'CHECKED_IN'

export interface GuestLifecycleFilters {
  paymentStatus?: GuestPaymentStatus
  waiverSigned?: boolean
  shirtPrepared?: boolean
  shirtCollected?: boolean
  checkInStatus?: GuestCheckInStatus
  roomType?: 'PRIVATE' | 'DOUBLE' | 'SHARED' | 'UNASSIGNED'
  search?: string
}

export interface GuestLifecycleRow {
  id: string
  eventId: string
  firstName: string
  lastName: string
  email: string | null
  phoneNumber: string | null
  packageName: string | null
  paymentStatus: GuestPaymentStatus
  waiverSigned: boolean
  shirtPrepared: boolean
  shirtCollected: boolean
  checkInStatus: GuestCheckInStatus
  tShirtSize: string | null
  privateRoomRequested: boolean
  doubleRoomRequested: boolean
  roomCode: string | null
  bookingBuyerEmail: string | null
  bookingBalanceDue: number | null
  updatedAt: string
}
