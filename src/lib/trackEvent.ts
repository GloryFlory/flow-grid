/**
 * Event Tracking Helper for FlowGrid
 * 
 * Logs events to both:
 * 1. Prisma Analytics table (for internal admin dashboard)
 * 2. Amplitude (for external product analytics)
 */

import { prisma } from './prisma'

export interface TrackEventOptions {
  userId?: string
  festivalId?: string
  event: string
  properties?: Record<string, any>
  deviceId?: string
}

/**
 * Track an event in both Prisma and Amplitude
 * 
 * @example
 * ```ts
 * await trackEvent({
 *   userId: 'user_123',
 *   festivalId: 'festival_abc',
 *   event: 'schedule_viewed',
 *   properties: { source: 'direct_link' }
 * })
 * ```
 */
export async function trackEvent(options: TrackEventOptions): Promise<void> {
  const { userId, festivalId, event, properties, deviceId } = options

  try {
    // 1. Log to Prisma Analytics table
    await prisma.analytics.create({
      data: {
        userId,
        festivalId,
        event,
        properties: properties || {},
        deviceId,
        timestamp: new Date()
      }
    })

    // 2. Send to Amplitude (if API key is configured)
    if (process.env.AMPLITUDE_API_KEY) {
      await sendToAmplitude({
        userId,
        event,
        properties: {
          ...properties,
          festivalId,
          deviceId
        }
      })
    }
  } catch (error) {
    // Log error but don't throw - tracking should never break the app
    console.error('Error tracking event:', error)
  }
}

/**
 * Send event to Amplitude using their HTTP API
 */
async function sendToAmplitude(data: {
  userId?: string
  event: string
  properties?: Record<string, any>
}): Promise<void> {
  try {
    const amplitudePayload = {
      api_key: process.env.AMPLITUDE_API_KEY,
      events: [
        {
          user_id: data.userId || 'anonymous',
          event_type: data.event,
          event_properties: data.properties || {},
          time: Date.now()
        }
      ]
    }

    await fetch('https://api2.amplitude.com/2/httpapi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*'
      },
      body: JSON.stringify(amplitudePayload)
    })
  } catch (error) {
    console.error('Error sending to Amplitude:', error)
  }
}

/**
 * Helper to track schedule view events
 */
export async function trackScheduleView(festivalId: string, deviceId?: string, userId?: string) {
  return trackEvent({
    festivalId,
    deviceId,
    userId,
    event: 'schedule_viewed'
  })
}

/**
 * Helper to track session click events
 */
export async function trackSessionClick(
  festivalId: string,
  sessionId: string,
  deviceId?: string,
  userId?: string
) {
  return trackEvent({
    festivalId,
    deviceId,
    userId,
    event: 'session_clicked',
    properties: { sessionId }
  })
}

/**
 * Helper to track schedule share events
 */
export async function trackScheduleShare(
  festivalId: string,
  method: string,
  deviceId?: string,
  userId?: string
) {
  return trackEvent({
    festivalId,
    deviceId,
    userId,
    event: 'schedule_shared',
    properties: { method }
  })
}

/**
 * Helper to track filter usage events
 */
export async function trackFilterUsed(
  festivalId: string,
  filterType: string,
  filterValue: string,
  deviceId?: string,
  userId?: string
) {
  return trackEvent({
    festivalId,
    deviceId,
    userId,
    event: 'filter_used',
    properties: { filterType, filterValue }
  })
}
