/**
 * Analytics consent and tracking utilities
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

const COOKIE_CONSENT_KEY = 'flow-grid-cookie-consent';

/**
 * Check if user has consented to analytics cookies
 */
export const hasAnalyticsConsent = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
  return consent === 'accepted';
};

/**
 * Track an analytics event (only if user has consented)
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
