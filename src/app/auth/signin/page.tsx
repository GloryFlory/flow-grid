'use client'

// Updated: 2025-11-03 - Force rebuild with magic link auth
import { useState, useEffect, useRef, useMemo } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Mail, Chrome, Key, CheckCircle, Info, AlertCircle, X } from 'lucide-react'
import { useConditionalPasskey } from '@/hooks/useConditionalPasskey'
import { getAuthenticatorName } from '@/lib/passkeys'

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const emailRef = useRef<HTMLInputElement>(null)

  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMethod, setLoadingMethod] = useState<'email' | 'google' | 'passkey' | null>(null)
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [statusDismissed, setStatusDismissed] = useState(false)

  // Use the conditional passkey hook
  const {
    supported: passkeySupported,
    conditionalSupported,
    tryOptional,
    isAuthenticating: isPasskeyAuthenticating,
    error: passkeyError,
  } = useConditionalPasskey({
    emailRef,
    onSuccess: async () => {
      try {
        const result = await signIn('credentials', {
          email,
          passkeyVerified: 'true',
          redirect: false,
        })
        
        if (result?.error) {
          setError('Failed to create session after passkey verification')
          setIsLoading(false)
          setLoadingMethod(null)
        } else {
          router.push(callbackUrl)
        }
      } catch (err) {
        console.error('Failed to sign in after passkey verification:', err)
        setError('Failed to create session')
        setIsLoading(false)
        setLoadingMethod(null)
      }
    },
    onUnsupported: () => {
      console.log('Passkeys not supported on this device')
    },
  })

  useEffect(() => {
    if (isPasskeyAuthenticating) {
      setIsLoading(true)
      setLoadingMethod('passkey')
    }
  }, [isPasskeyAuthenticating])

  useEffect(() => {
    if (passkeyError) {
      setError(passkeyError)
      setIsLoading(false)
      setLoadingMethod(null)
    }
  }, [passkeyError])

  useEffect(() => {
    setStatusDismissed(false)
  }, [email])

  const authenticatorName = getAuthenticatorName()

  const statusBanner = useMemo(() => {
    if (statusDismissed) {
      return null
    }

    const trimmedEmail = email.trim()
    const isEmailValid = /\S+@\S+\.\S+/.test(trimmedEmail)

    if (!trimmedEmail || !isEmailValid) {
      return null
    }

    if (passkeySupported && conditionalSupported) {
      return (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Tip:</strong> You can use {authenticatorName} here if you've set up a passkey.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setStatusDismissed(true)}
            className="text-blue-500 hover:text-blue-700"
            aria-label="Dismiss tip"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )
    }

    return null
  }, [statusDismissed, email, passkeySupported, conditionalSupported, authenticatorName])

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoadingMethod('email')
    setError('')

    try {
      const result = await signIn('email', {
        email,
        callbackUrl,
        redirect: false,
      })

      if (result?.error) {
        setError('Failed to send magic link. Please try again.')
      } else {
        setEmailSent(true)
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
      setLoadingMethod(null)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setLoadingMethod('google')
    setError('')

    try {
      await signIn('google', { callbackUrl })
    } catch (error) {
      setError('Failed to sign in with Google')
      setIsLoading(false)
      setLoadingMethod(null)
    }
  }

  const handlePasskeySignIn = async () => {
    setError('')
    await tryOptional()
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Link href="/">
                <Image 
                  src="/flow-grid-logo.png" 
                  alt="Flow Grid" 
                  width={242} 
                  height={60}
                  className="h-15 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                />
              </Link>
            </div>
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <p className="text-gray-600 mt-2">
              We sent a sign-in link to <strong>{email}</strong>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-gray-600">
              <p>Click the link in your email to sign in.</p>
              <p className="mt-2">The link expires in 30 minutes.</p>
            </div>
            
            <div className="pt-4">
              <button
                onClick={() => setEmailSent(false)}
                className="w-full text-blue-600 hover:text-blue-500 font-medium text-sm"
              >
                Try a different email
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Link href="/">
              <Image 
                src="/flow-grid-logo.png" 
                alt="Flow Grid" 
                width={242} 
                height={60}
                className="h-15 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
          </div>
          <CardTitle className="text-2xl">Sign in to Flow Grid</CardTitle>
          <p className="text-gray-600 mt-2">
            Manage your festival schedules
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => setError('')}
                className="text-red-500 hover:text-red-700"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {statusBanner}

          <form onSubmit={handleMagicLink} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@example.com"
                required
                disabled={isLoading}
                autoComplete="email webauthn"
              />
              {conditionalSupported && (
                <p className="mt-1 text-xs text-gray-500">
                  Your device biometrics will appear above if you've set up a passkey
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !email.trim()}
            >
              {isLoading && loadingMethod === 'email' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending link...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Continue with Email
                </>
              )}
            </Button>
          </form>

          {passkeySupported && (
            <Button
              onClick={handlePasskeySignIn}
              variant="outline"
              className="w-full"
              disabled={isLoading || !email.trim()}
            >
              {isLoading && loadingMethod === 'passkey' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  Sign in with {authenticatorName}
                </>
              )}
            </Button>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>

          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading && loadingMethod === 'google' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Chrome className="w-4 h-4 mr-2" />
                Continue with Google
              </>
            )}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-blue-600 hover:text-blue-500 font-medium">
              Sign up
            </Link>
          </p>

          <p className="text-center text-xs text-gray-500 mt-4">
            By signing in, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
