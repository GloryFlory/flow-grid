/**
 * Analytics consent and tracking utilities
 * Stub implementation - integrate with your analytics provider
 */

type AnalyticsEvent = 
  | 'passkey_login_attempt'
  | 'passkey_registration_start'
  | 'passkey_registration_success'
  | 'passkey_registration_cancel'
  | 'passkey_check_performed';

interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Check if user has consented to analytics
 * Default to true for now - implement proper consent management
 */
export const hasAnalyticsConsent = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // TODO: Implement proper consent check
  // e.g., localStorage.getItem('analytics_consent') === 'true'
  return true;
};

/**
 * Track an analytics event (guarded by consent)
 */
export const track = (event: AnalyticsEvent, properties?: EventProperties): void => {
  if (!hasAnalyticsConsent()) return;
  
  // Stub implementation - replace with your analytics provider
  console.log('[Analytics]', event, properties);
  
  // Example integrations:
  // - Plausible: plausible(event, { props: properties })
  // - PostHog: posthog.capture(event, properties)
  // - Google Analytics: gtag('event', event, properties)
};
