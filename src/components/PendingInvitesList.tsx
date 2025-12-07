'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Trash2, Loader2, Crown, Shield, Edit, Eye, X, Copy, Check } from 'lucide-react'

interface PendingInvite {
  id: string
  email: string
  role: string
  invitedAt: Date
  inviteToken: string | null
}

interface PendingInvitesListProps {
  invites: PendingInvite[]
  festivalId: string
  canManage?: boolean
}

export default function PendingInvitesList({
  invites,
  festivalId,
  canManage = true
}: PendingInvitesListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; email: string } | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <Crown className="w-4 h-4 text-yellow-600" />
      case 'ADMIN':
        return <Shield className="w-4 h-4 text-blue-600" />
      case 'EDITOR':
        return <Edit className="w-4 h-4 text-green-600" />
      case 'VIEWER':
        return <Eye className="w-4 h-4 text-gray-600" />
      default:
        return null
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'EDITOR':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'VIEWER':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleCancelInvite = async (inviteId: string, email: string) => {
    setConfirmDelete({ id: inviteId, email })
  }

  const confirmCancelInvite = async () => {
    if (!confirmDelete) return

    setDeletingId(confirmDelete.id)
    setConfirmDelete(null)

    try {
      const response = await fetch(`/api/festivals/${festivalId}/team/${confirmDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to cancel invite')
      }

      toast.success(`Cancelled invitation for ${confirmDelete.email}`)
      router.refresh()
    } catch (error) {
      console.error('Failed to cancel invitation:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to cancel invitation')
    } finally {
      setDeletingId(null)
    }
  }

  const handleCopyInviteLink = async (inviteToken: string, inviteId: string) => {
    const inviteUrl = `${window.location.origin}/team/accept/${inviteToken}`
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopiedId(inviteId)
      toast.success('Invite link copied to clipboard')
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  return (
    <>
      {/* Confirmation Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Cancel Invitation?
                </h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to cancel the invitation for{' '}
                  <span className="font-medium text-gray-900">{confirmDelete.email}</span>?
                  They will no longer be able to accept this invitation.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setConfirmDelete(null)}
                variant="outline"
                size="sm"
              >
                Keep Invitation
              </Button>
              <Button
                onClick={confirmCancelInvite}
                variant="destructive"
                size="sm"
              >
                Cancel Invitation
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Invites List */}
      <div className="space-y-3">
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                {invite.email[0].toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-gray-900">{invite.email}</div>
                <div className="text-sm text-gray-600">
                  Invited {new Date(invite.invitedAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(invite.role)} flex items-center gap-2`}>
                {getRoleIcon(invite.role)}
                {invite.role}
              </div>
              {invite.inviteToken && (
                <Button
                  onClick={() => handleCopyInviteLink(invite.inviteToken!, invite.id)}
                  variant="outline"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900"
                >
                  {copiedId === invite.id ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              )}
              {canManage && (
                <Button
                  onClick={() => handleCancelInvite(invite.id, invite.email)}
                  disabled={deletingId === invite.id}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {deletingId === invite.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
