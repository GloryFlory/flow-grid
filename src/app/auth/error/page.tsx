'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import Image from 'next/image'

const errorMessages = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The verification token has expired or has already been used.',
  Default: 'An error occurred during authentication.',
  OAuthCallback: 'There was an error with the OAuth provider callback.',
  OAuthAccountNotLinked: 'The account is not linked. Please sign in with your original provider.',
  EmailCreateAccount: 'Could not create an account with this email.',
  Callback: 'There was an error in the callback handler.',
  OAuthSignin: 'Error signing in with OAuth provider.',
  EmailSignin: 'Check your email for a sign-in link.',
  CredentialsSignin: 'Invalid credentials.',
  SessionRequired: 'Please sign in to access this page.',
}

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') as keyof typeof errorMessages

  const errorMessage = errorMessages[error] || errorMessages.Default

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Image 
              src="/flow-grid-logo.png" 
              alt="Flow Grid" 
              width={242} 
              height={60}
              className="h-15 w-auto"
            />
          </div>
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-16 h-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl text-red-600">Authentication Error</CardTitle>
          <p className="text-gray-600">
            {errorMessage}
          </p>
          {error && (
            <p className="text-sm text-gray-500 mt-2">
              Error code: {error}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-600">
            <p>This could be due to:</p>
            <ul className="text-left mt-2 space-y-1">
              <li>• Server configuration issues</li>
              <li>• OAuth provider settings</li>
              <li>• Network connectivity problems</li>
              <li>• Account permission restrictions</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <Link href="/auth/signin">
              <Button className="w-full">
                Try Again
              </Button>
            </Link>
            
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="text-center text-xs text-gray-500">
            If this problem persists, please contact support.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4">
        <div className="text-center">Loading...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}