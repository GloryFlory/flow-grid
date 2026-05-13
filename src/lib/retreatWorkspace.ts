export type GuestPaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID'

export interface RetreatGuestRecord {
  id: string
  firstName: string
  lastName: string
  email: string | null
  buyerEmail: string | null
  phoneNumber: string | null
  packageName: string | null
  privateRoomRequested: boolean
  doubleRoomRequested: boolean
  roomSharePreference: string | null
  tShirtSize: string | null
  dietaryRequirements: string | null
  emergencyContact: string | null
  checkoutInfo: string | null
  waiverAccepted: boolean
  photoConsent: boolean
  newsletterConsent: boolean
  paymentStatus: GuestPaymentStatus
  shirtPrepared: boolean
  shirtCollected: boolean
  checkInStatus: 'NOT_CHECKED_IN' | 'CHECKED_IN'
  balanceDue: number | null
  successfulPayments: number | null
  tripPrice: number | null
  roomCode: string | null
  notes: string | null
  // Specific insight fields for analytics
  preferredRole: string | null
  acroYogaExperience: string | null
  skillsToLearn: string | null
  // Store ALL imported row data for transparency in UI
  importedFields: Record<string, string>
}

export interface RetreatGeneralInfo {
  checkInLocation: string
  checkInOpenAt: string
  organiserNotes: string
}

export interface RetreatImportSummary {
  workbookName: string
  bookingsSheet: string
  participantsSheet: string
  importedAtIso: string
  bookingRows: number
  participantRows: number
}

export interface RetreatWorkspaceData {
  generalInfo: RetreatGeneralInfo
  importSummary: RetreatImportSummary | null
  guests: RetreatGuestRecord[]
}

const STORAGE_PREFIX = 'flowgrid:retreat-workspace:'

export function getRetreatWorkspaceStorageKey(festivalId: string): string {
  return `${STORAGE_PREFIX}${festivalId}`
}

export function defaultRetreatWorkspaceData(): RetreatWorkspaceData {
  return {
    generalInfo: {
      checkInLocation: '',
      checkInOpenAt: '',
      organiserNotes: '',
    },
    importSummary: null,
    guests: [],
  }
}

export function readRetreatWorkspace(festivalId: string): RetreatWorkspaceData {
  if (typeof window === 'undefined') {
    return defaultRetreatWorkspaceData()
  }

  try {
    const raw = window.localStorage.getItem(getRetreatWorkspaceStorageKey(festivalId))
    if (!raw) {
      return defaultRetreatWorkspaceData()
    }

    const parsed = JSON.parse(raw) as RetreatWorkspaceData
    return {
      ...defaultRetreatWorkspaceData(),
      ...parsed,
      generalInfo: {
        ...defaultRetreatWorkspaceData().generalInfo,
        ...(parsed.generalInfo || {}),
      },
      guests: Array.isArray(parsed.guests) ? parsed.guests : [],
    }
  } catch {
    return defaultRetreatWorkspaceData()
  }
}

export function writeRetreatWorkspace(festivalId: string, data: RetreatWorkspaceData): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(getRetreatWorkspaceStorageKey(festivalId), JSON.stringify(data))
}
