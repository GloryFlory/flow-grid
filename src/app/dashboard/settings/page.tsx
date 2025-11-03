'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { User, Mail, Lock, Bell, Shield, AlertCircle, Key, Smartphone, CheckCircle2, LogOut, Globe } from 'lucide-react'
import { passkeysSupported, getAuthenticatorName, analytics } from '@/lib/passkeys'
import { track } from '@/lib/consent'
import { startRegistration } from '@simplewebauthn/browser'
import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/types'

interface Passkey {
  id: string
  credentialId: string
  createdAt: string
  lastUsedAt: string | null
  transports: string | null
}

type SettingsTab = 'account' | 'security' | 'notifications' | 'danger-zone'

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') as SettingsTab | null
  
  const [activeTab, setActiveTab] = useState<SettingsTab>(tabParam || 'account')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [passkeys, setPasskeys] = useState<Passkey[]>([])
  const [isLoadingPasskeys, setIsLoadingPasskeys] = useState(true)
  const [passkeySupported, setPasskeySupported] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [hasPassword, setHasPassword] = useState<boolean | null>(null) // null = loading

  const [profileData, setProfileData] = useState({
    name: '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Populate email from session (read-only)
  const userEmail = session?.user?.email || ''

  // Update tab from URL parameter
  useEffect(() => {
    if (tabParam && ['account', 'security', 'notifications', 'danger-zone'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  // Populate profile data from session
  useEffect(() => {
    if (session?.user?.name) {
      setProfileData({ name: session.user.name })
    }
  }, [session])

  // Check passkey support and fetch passkeys on mount
  useEffect(() => {
    passkeysSupported().then(setPasskeySupported)
    fetchPasskeys()
    checkHasPassword()
  }, [])

  const checkHasPassword = async () => {
    try {
      const response = await fetch('/api/user/has-password')
      if (response.ok) {
        const data = await response.json()
        setHasPassword(data.hasPassword)
      }
    } catch (error) {
      console.error('Failed to check password status:', error)
      setHasPassword(false)
    }
  }

  const fetchPasskeys = async () => {
    setIsLoadingPasskeys(true)
    try {
      const response = await fetch('/api/webauthn/list')
      if (response.ok) {
        const data = await response.json()
        setPasskeys(data.credentials || [])
      }
    } catch (error) {
      console.error('Failed to fetch passkeys:', error)
    } finally {
      setIsLoadingPasskeys(false)
    }
  }

  const handleAddPasskey = async () => {
    setIsRegistering(true)
    setMessage(null)

    try {
      track('passkey_registration_start')
      analytics.passkeys.registration.modal_shown()

      // Get registration options from server
      const optionsRes = await fetch('/api/webauthn/registration/options', {
        method: 'POST',
      })

      if (!optionsRes.ok) {
        const error = await optionsRes.json()
        throw new Error(error.error || 'Failed to start registration')
      }

      const { options, challengeKey } = await optionsRes.json()

      console.log('[Passkey Registration] Starting registration with options from server')

      // Use SimpleWebAuthn's startRegistration - it handles all base64 conversions automatically!
      const credential = await startRegistration(options)

      console.log('[Passkey Registration] Credential created successfully')

      // Verify registration
      const verifyRes = await fetch('/api/webauthn/registration/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeKey,
          credential,
        }),
      })

      if (!verifyRes.ok) {
        const error = await verifyRes.json()
        throw new Error(error.error || 'Verification failed')
      }

      track('passkey_registration_success')
      analytics.passkeys.registration.success()
      
      const authenticatorName = getAuthenticatorName()
      setMessage({ 
        type: 'success', 
        text: `Passkey added! You can now sign in with ${authenticatorName}.` 
      })
      
      // Refresh passkeys list
      fetchPasskeys()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add passkey'
      setMessage({ type: 'error', text: errorMessage })
      track('passkey_registration_cancel')
      analytics.passkeys.registration.error(errorMessage)
    } finally {
      setIsRegistering(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        // Update the session with new name
        await update()
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.message || 'Failed to update profile' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      setIsSaving(false)
      return
    }

    // If user doesn't have password, don't require current password
    const requestBody = hasPassword 
      ? {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }
      : {
          newPassword: passwordData.newPassword,
        }

    try {
      const response = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        const successMessage = hasPassword 
          ? 'Password updated successfully!' 
          : 'Password set successfully! You can now use it to sign in.'
        setMessage({ type: 'success', text: successMessage })
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setHasPassword(true) // User now has a password
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.message || 'Failed to update password' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account, security, and preferences</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-lg shadow-sm border border-gray-200 border-b-0">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('account')}
              className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'account'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <User className="w-4 h-4" />
              Account
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'security'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Shield className="w-4 h-4" />
              Security
              {passkeys.length === 0 && (
                <span className="ml-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                  Action needed
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'notifications'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Bell className="w-4 h-4" />
              Notifications
              <span className="text-xs text-gray-400">(Coming Soon)</span>
            </button>
            <button
              onClick={() => setActiveTab('danger-zone')}
              className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'danger-zone'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              Danger Zone
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg shadow-sm border border-gray-200 p-6 min-h-[400px]">
          {/* Message Banner */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>{message.text}</span>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="email"
                        id="email"
                        value={userEmail}
                        disabled
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                      <button
                        type="button"
                        onClick={() => setMessage({ type: 'error', text: 'Email change feature coming soon!' })}
                        className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        Change Email
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Your email is used for sign-in and notifications. Changing it requires verification.
                    </p>
                  </div>
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-8">
              {/* Passkeys Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Passkeys</h3>
                    <p className="text-sm text-gray-600 mt-1">Secure, passwordless authentication</p>
                  </div>
                  {passkeySupported && (
                    <button
                      onClick={handleAddPasskey}
                      disabled={isRegistering}
                      className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Key className="w-4 h-4" />
                      {isRegistering ? 'Adding...' : 'Add Passkey'}
                    </button>
                  )}
                </div>

                {/* Passkey Explainer */}
                {passkeys.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Recommended: Add a passkey for secure sign-in
                    </h4>
                    <ul className="text-sm text-yellow-800 space-y-1 ml-6 list-disc">
                      <li>Sign in with Face ID, Touch ID, or fingerprint</li>
                      <li>More secure than passwords - can't be phished</li>
                      <li>Works across your devices</li>
                    </ul>
                  </div>
                )}

                {!passkeySupported && (
                  <p className="text-sm text-gray-600 flex items-center gap-2 mb-4">
                    <AlertCircle className="w-4 h-4" />
                    Passkeys are not supported on this device or browser.
                  </p>
                )}

                {/* Passkeys List */}
                <div>
                  {passkeys.length > 0 ? (
                    <div className="space-y-3">
                      {passkeys.map((passkey, index) => (
                        <div
                          key={passkey.id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <Smartphone className="w-5 h-5 text-gray-500 mt-0.5" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  Passkey {index + 1}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  Added {formatDate(passkey.createdAt)}
                                </p>
                                {passkey.lastUsedAt && (
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    Last used {formatDate(passkey.lastUsedAt)}
                                  </p>
                                )}
                              </div>
                            </div>
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : !isLoadingPasskeys ? (
                    <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
                      <Key className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No passkeys registered yet.</p>
                      <p className="text-xs mt-1">Add one above to enable faster, more secure sign-in.</p>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Password Section */}
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {hasPassword ? 'Change Password' : 'Set Password'}
                  </h3>
                  {!hasPassword && (
                    <p className="text-sm text-gray-600 mt-1">
                      You signed up with magic link. Set a password to enable password-based sign-in.
                    </p>
                  )}
                </div>
                
                {hasPassword === null ? (
                  <p className="text-sm text-gray-500">Loading...</p>
                ) : (
                  <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
                    {hasPassword && (
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          id="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your current password"
                          required
                        />
                      </div>
                    )}
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        {hasPassword ? 'New Password' : 'Password'}
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={hasPassword ? "Enter your new password" : "Enter a password (min. 8 characters)"}
                        minLength={8}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Confirm your password"
                        minLength={8}
                        required
                      />
                    </div>
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? (hasPassword ? 'Updating...' : 'Setting...') : (hasPassword ? 'Update Password' : 'Set Password')}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Sign-in Methods Overview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sign-in Methods</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">Magic Link</p>
                        <p className="text-sm text-gray-600">Sign in via email link</p>
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">Passkeys</p>
                        <p className="text-sm text-gray-600">{passkeys.length} registered</p>
                      </div>
                    </div>
                    {passkeys.length > 0 ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                        Not set up
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Notifications Coming Soon</h3>
              <p className="text-gray-600 text-sm max-w-md mx-auto">
                We're working on email notification preferences. You'll be able to control what emails you receive and how often.
              </p>
            </div>
          )}

          {/* Danger Zone Tab */}
          {activeTab === 'danger-zone' && (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Permanent Actions
                </h4>
                <p className="text-sm text-red-800">
                  Actions in this section are irreversible. Please proceed with caution.
                </p>
              </div>

              <div className="border border-red-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Delete Account</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Permanently delete your account and all associated data including:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 ml-6 list-disc mb-4">
                      <li>All festivals you've created</li>
                      <li>Session and teacher data</li>
                      <li>Account preferences and settings</li>
                      <li>Passkeys and authentication methods</li>
                    </ul>
                    <p className="text-sm font-medium text-red-600">
                      This action cannot be undone. Your data will be permanently lost.
                    </p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    disabled
                    className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Account deletion temporarily disabled"
                  >
                    Delete My Account
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Account deletion is temporarily disabled. Contact support if you need to delete your account.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
