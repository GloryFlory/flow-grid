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
  teamMembersLimit: number
  customBranding: boolean
  customSubdomain: boolean
  customDomain: boolean
  embedWidget: boolean
  advancedBooking: boolean
  basicAnalytics: boolean
  advancedAnalytics: boolean
  analyticsExport: boolean
  cloneEvents: boolean
  prioritySupport: boolean
  dedicatedSupport: boolean
  whiteLabel: boolean
  apiAccess: boolean
}

export const PLAN_FEATURES: Record<PlanType, PlanFeatures> = {
  FREE: {
    festivalsLimit: 1,
    sessionsLimit: -1, // unlimited
    teamMembersLimit: 1,
    customBranding: true, // basic colors + logo
    customSubdomain: false,
    customDomain: false,
    embedWidget: false,
    advancedBooking: false,
    basicAnalytics: true,
    advancedAnalytics: false,
    analyticsExport: false,
    cloneEvents: false,
    prioritySupport: false,
    dedicatedSupport: false,
    whiteLabel: false, // shows "Powered by Flow Grid"
    apiAccess: false,
  },
  PRO: {
    festivalsLimit: 5,
    sessionsLimit: -1, // unlimited
    teamMembersLimit: 5,
    customBranding: true,
    customSubdomain: true,
    customDomain: false,
    embedWidget: true,
    advancedBooking: false,
    basicAnalytics: true,
    advancedAnalytics: true,
    analyticsExport: false,
    cloneEvents: true,
    prioritySupport: true,
    dedicatedSupport: false,
    whiteLabel: true, // no "Powered by" branding
    apiAccess: false,
  },
  ENTERPRISE: {
    festivalsLimit: -1, // unlimited
    sessionsLimit: -1, // unlimited
    teamMembersLimit: -1, // unlimited
    customBranding: true,
    customSubdomain: true,
    customDomain: true,
    embedWidget: true,
    advancedBooking: true,
    basicAnalytics: true,
    advancedAnalytics: true,
    analyticsExport: true,
    cloneEvents: true,
    prioritySupport: true,
    dedicatedSupport: true,
    whiteLabel: true,
    apiAccess: true,
  },
}