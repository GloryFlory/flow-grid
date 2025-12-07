'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { toast } from 'sonner'
import { Mail, Loader2 } from 'lucide-react'

interface TeamInviteFormProps {
  festivalId: string
}

export default function TeamInviteForm({ festivalId }: TeamInviteFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'ADMIN' | 'EDITOR' | 'VIEWER'>('EDITOR')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/festivals/${festivalId}/team/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, role }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invite')
      }

      toast.success(`Invitation sent to ${email}`)
      
      // Log to console for testing until email is implemented
      if (data.inviteUrl) {
        console.log('📧 Invitation URL (for testing):', data.inviteUrl)
      }
      
      setEmail('')
      setRole('EDITOR')
      router.refresh()
    } catch (error) {
      console.error('Failed to invite team member:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send invite')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="pl-10"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as 'ADMIN' | 'EDITOR' | 'VIEWER')}
            disabled={isLoading}
            className="mt-1 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="ADMIN">Admin</option>
            <option value="EDITOR">Editor</option>
            <option value="VIEWER">Viewer</option>
          </select>
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending Invitation...
          </>
        ) : (
          <>
            <Mail className="w-4 h-4 mr-2" />
            Send Invitation
          </>
        )}
      </Button>
    </form>
  )
}
