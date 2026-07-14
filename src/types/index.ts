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

// Monetisation is disabled: Flow Grid is free and donation-supported, so FREE
// includes every feature. PRO/ENTERPRISE remain only for grandfathered
// subscribers (their one perk: whiteLabel hides the "Powered by Flow Grid" badge).
export const PLAN_FEATURES: Record<PlanType, PlanFeatures> = {
  FREE: {
    festivalsLimit: -1, // unlimited
    sessionsLimit: -1, // unlimited
    teamMembersLimit: 10, // flat cap — invites send emails, so keep a spam backstop
    customBranding: true,
    customSubdomain: true,
    customDomain: false,
    embedWidget: true,
    advancedBooking: true,
    basicAnalytics: true,
    advancedAnalytics: true,
    analyticsExport: true,
    cloneEvents: true,
    prioritySupport: false,
    dedicatedSupport: false,
    whiteLabel: false, // shows "Powered by Flow Grid" — the badge markets the free tool
    apiAccess: false,
  },
  PRO: {
    festivalsLimit: 5,
    sessionsLimit: -1, // unlimited
    teamMembersLimit: 3, // Pricing page says "Up to 3 team members"
    customBranding: true,
    customSubdomain: true,
    customDomain: false,
    embedWidget: true,
    advancedBooking: false,
    basicAnalytics: true,
    advancedAnalytics: true,
    analyticsExport: true, // Pro includes analytics export
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