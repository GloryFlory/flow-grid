import { Festival, FestivalSession, User, Subscription } from '@prisma/client'

export type FestivalWithSessions = Festival & {
  sessions: FestivalSession[]
  user: User
}

export type UserWithSubscription = User & {
  subscription: Subscription | null
  festivals: Pick<Festival, 'id' | 'name' | 'slug' | 'isPublished'>[]
}

export type SessionWithBookings = FestivalSession & {
  bookings: {
    names: string[]
    deviceId: string
  }[]
  _count: {
    bookings: number
  }
}

// Legacy session type for migration
export interface LegacySession {
  id: string
  title: string
  description: string
  day: string
  start: string
  end: string
  location: string
  level: string
  styles: string[]
  teachers: string[]
  prereqs: string
  cardType?: string
}

// Festival setup form types
export interface FestivalSetupData {
  name: string
  description?: string
  location?: string
  startDate: Date
  endDate: Date
  timezone: string
  slug: string
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
}

// CSV upload types
export interface CSVRowData {
  title: string
  description?: string
  day: string
  start: string
  end: string
  location?: string
  level?: string
  styles?: string
  teachers?: string
  prereqs?: string
  capacity?: string
  cardType?: string
}

// Plan types for subscription management
export type PlanType = 'FREE' | 'PRO' | 'ENTERPRISE'

export interface PlanFeatures {
  festivalsLimit: number
  sessionsLimit: number
  customBranding: boolean
  customDomain: boolean
  advancedBooking: boolean
  analytics: boolean
  priority: boolean
  whiteLabel: boolean
}

export const PLAN_FEATURES: Record<PlanType, PlanFeatures> = {
  FREE: {
    festivalsLimit: 1,
    sessionsLimit: 50,
    customBranding: false,
    customDomain: false,
    advancedBooking: false,
    analytics: false,
    priority: false,
    whiteLabel: false,
  },
  PRO: {
    festivalsLimit: 10,
    sessionsLimit: -1, // unlimited
    customBranding: true,
    customDomain: true,
    advancedBooking: true,
    analytics: true,
    priority: true,
    whiteLabel: false,
  },
  ENTERPRISE: {
    festivalsLimit: -1, // unlimited
    sessionsLimit: -1, // unlimited
    customBranding: true,
    customDomain: true,
    advancedBooking: true,
    analytics: true,
    priority: true,
    whiteLabel: true,
  },
}