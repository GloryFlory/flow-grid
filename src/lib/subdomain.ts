import { NextRequest } from 'next/server'

/**
 * Extracts the subdomain from a request URL
 * Returns null if it's the main domain or www
 */
export function getSubdomain(req: NextRequest): string | null {
  const host = req.headers.get('host')
  if (!host) return null

  // Remove port for local development
  const hostname = host.split(':')[0]
  
  // Handle localhost and main domain
  if (hostname === 'localhost' || hostname === 'tryflowgrid.com' || hostname === 'www.tryflowgrid.com') {
    return null
  }

  // Extract subdomain
  const parts = hostname.split('.')
  if (parts.length < 2) return null

  // For *.tryflowgrid.com -> return subdomain
  if (parts.length >= 3 && parts[parts.length - 2] === 'tryflowgrid') {
    return parts[0]
  }

  // For custom domains, we need to check the database
  // This will be handled in middleware
  return null
}

/**
 * Determines the app type based on the subdomain/domain
 */
export type AppType = 'marketing' | 'dashboard' | 'schedule' | 'custom'

export function getAppType(req: NextRequest): { type: AppType; identifier?: string } {
  const subdomain = getSubdomain(req)
  const pathname = req.nextUrl.pathname

  // Marketing site (main domain)
  if (!subdomain) {
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/app')) {
      return { type: 'dashboard' }
    }
    return { type: 'marketing' }
  }

  // Dashboard subdomain
  if (subdomain === 'app' || subdomain === 'dashboard') {
    return { type: 'dashboard' }
  }

  // Festival schedule subdomain
  return { type: 'schedule', identifier: subdomain }
}

/**
 * Checks if the current request is for a festival schedule
 */
export function isFestivalRequest(req: NextRequest): boolean {
  const { type } = getAppType(req)
  return type === 'schedule' || type === 'custom'
}

/**
 * Gets the festival slug from request
 */
export function getFestivalSlug(req: NextRequest): string | null {
  const { type, identifier } = getAppType(req)
  
  if (type === 'schedule' && identifier) {
    return identifier
  }

  // For custom domains, identifier would be the full domain
  if (type === 'custom' && identifier) {
    return identifier
  }

  return null
}

/**
 * Builds URLs for different app types
 */
export const urls = {
  marketing: (path: string = '') => `${process.env.NEXT_PUBLIC_MARKETING_URL}${path}`,
  dashboard: (path: string = '') => `${process.env.NEXT_PUBLIC_APP_URL}/dashboard${path}`,
  festival: (slug: string, path: string = '') => `https://${slug}.tryflowgrid.com${path}`,
  api: (path: string) => `${process.env.NEXT_PUBLIC_APP_URL}/api${path}`,
}

/**
 * Rewrite paths for multi-tenant routing
 */
export function rewritePath(req: NextRequest): string {
  const { type, identifier } = getAppType(req)
  const pathname = req.nextUrl.pathname

  switch (type) {
    case 'marketing':
      return `${pathname === '/' ? '' : pathname}`

    case 'dashboard':
      // Remove /dashboard prefix if it exists in the pathname
      const dashboardPath = pathname.startsWith('/dashboard') 
        ? pathname.replace('/dashboard', '') 
        : pathname
      return `/dashboard${dashboardPath === '/' ? '' : dashboardPath}`

    case 'schedule':
      // Rewrite to schedule app with festival slug
      return `/schedule/${identifier}${pathname === '/' ? '' : pathname}`

    case 'custom':
      // Handle custom domains
      return `/schedule/custom${pathname === '/' ? '' : pathname}`

    default:
      return pathname
  }
}