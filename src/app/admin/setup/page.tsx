'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Crown, Mail, CheckCircle, XCircle } from 'lucide-react'

export default function AdminSetupPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null)

  const handleMakeAdmin = async () => {
    if (!email) return
    
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/assign-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          makeAdmin: true
        })
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ 
          success: true, 
          message: `Successfully made ${email} an admin!` 
        })
        setEmail('')
      } else {
        setResult({ 
          success: false, 
          message: data.error || 'Failed to assign admin role' 
        })
      }
    } catch (error) {
      setResult({ 
        success: false, 
        message: 'Network error. Please try again.' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-purple-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Setup</CardTitle>
          <p className="text-gray-600">Assign admin privileges to a user account</p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="admin@flowgrid.com"
              />
            </div>
          </div>

          <Button 
            onClick={handleMakeAdmin}
            disabled={!email || isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? 'Processing...' : 'Make Admin'}
          </Button>

          {result && (
            <div className={`p-4 rounded-lg flex items-center gap-3 ${
              result.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <p className={`text-sm ${
                result.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.message}
              </p>
            </div>
          )}

          <div className="text-xs text-gray-500 text-center">
            This page allows the first admin assignment or requires existing admin privileges
          </div>
        </CardContent>
      </Card>
    </div>
  )
}