/**
 * Dashboard wrapper with first-login passkey setup prompt
 * 
 * Shows a dismissible banner encouraging users to set up a passkey
 * if they don't have one yet.
 */

'use client';

import { useEffect, useState } from 'react';
import { passkeysSupported } from '@/lib/passkeys';
import { Key, X } from 'lucide-react';
import Link from 'next/link';

const PASSKEY_BANNER_DISMISSED_KEY = 'fg:passkeyBannerDismissed';

interface DashboardWithPasskeySetupProps {
  user: {
    id: string;
    email: string;
    name: string;
  };
  hasPasskey: boolean;
  children: React.ReactNode;
}

/**
 * Wrapper component that shows passkey setup banner
 * 
 * Logic:
 * - Shows once per user (tracked by user ID in localStorage)
 * - Only shows if user doesn't have a passkey
 * - Only shows if passkeys are supported on this device
 * - User can dismiss permanently
 */
export function DashboardWithPasskeySetup({
  user,
  hasPasskey,
  children,
}: DashboardWithPasskeySetupProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [passkeySupport, setPasskeySupport] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkAndShow() {
      // Check if passkeys are supported
      const supported = await passkeysSupported();
      if (!mounted) return;
      
      setPasskeySupport(supported);

      // Don't show if passkeys not supported or user already has passkey
      if (!supported || hasPasskey) {
        return;
      }

      // Check if user has dismissed the banner
      const dismissedForUsers = typeof window !== 'undefined'
        ? localStorage.getItem(PASSKEY_BANNER_DISMISSED_KEY)
        : null;
      
      const dismissedUserIds = dismissedForUsers ? JSON.parse(dismissedForUsers) : [];
      const hasDismissed = dismissedUserIds.includes(user.id);

      // Show banner if not dismissed
      if (!hasDismissed) {
        setShowBanner(true);
      }
    }

    checkAndShow();

    return () => {
      mounted = false;
    };
  }, [hasPasskey, user.id]);

  const handleDismiss = () => {
    setShowBanner(false);
    
    // Mark banner as dismissed for this user
    if (typeof window !== 'undefined') {
      const dismissedForUsers = localStorage.getItem(PASSKEY_BANNER_DISMISSED_KEY);
      const dismissedUserIds = dismissedForUsers ? JSON.parse(dismissedForUsers) : [];
      const updatedUserIds = [...dismissedUserIds, user.id];
      localStorage.setItem(PASSKEY_BANNER_DISMISSED_KEY, JSON.stringify(updatedUserIds));
    }
  };

  return (
    <>
      {/* Passkey Setup Banner */}
      {passkeySupport && showBanner && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Key className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    Secure your account with passkeys
                  </p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    Sign in faster and more securely with Face ID, Touch ID, or fingerprint
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/settings?tab=security"
                  className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  Set up passkey
                </Link>
                <button
                  onClick={handleDismiss}
                  className="p-1 text-blue-600 hover:text-blue-700 rounded transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {children}
    </>
  );
}
