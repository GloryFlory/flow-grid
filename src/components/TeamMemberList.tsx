'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Trash2, Loader2, Crown, Shield, Edit, Eye, X } from 'lucide-react'

interface TeamMemberListProps {
  members: any[]
  festivalId: string
  canManage?: boolean
}

export default function TeamMemberList({
  members,
  festivalId,
  canManage = true
}: TeamMemberListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; email: string; name?: string } | null>(null)

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

  const handleRemoveMember = async (memberId: string, memberEmail: string, memberName?: string) => {
    setConfirmDelete({ id: memberId, email: memberEmail, name: memberName })
  }

  const confirmRemoveMember = async () => {
    if (!confirmDelete) return

    setDeletingId(confirmDelete.id)
    setConfirmDelete(null)

    try {
      const response = await fetch(`/api/festivals/${festivalId}/team/${confirmDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to remove member')
      }

      toast.success(`Removed ${confirmDelete.name || confirmDelete.email}`)
      router.refresh()
    } catch (error) {
      console.error('Failed to remove team member:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to remove member')
    } finally {
      setDeletingId(null)
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
                  Remove Team Member?
                </h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to remove{' '}
                  <span className="font-medium text-gray-900">
                    {confirmDelete.name || confirmDelete.email}
                  </span>{' '}
                  from this festival? They will lose access immediately.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setConfirmDelete(null)}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmRemoveMember}
                variant="destructive"
                size="sm"
              >
                Remove Member
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center gap-3">
              {member.user?.avatar ? (
                <img
                  src={member.user.avatar}
                  alt={member.user.name || member.email}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {(member.user?.name?.[0] || member.email[0]).toUpperCase()}
                </div>
              )}
              <div>
                <div className="font-medium text-gray-900">
                  {member.user?.name || member.email}
                </div>
                <div className="text-sm text-gray-600">
                  {member.user?.email || member.email}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(member.role)} flex items-center gap-2`}>
                {getRoleIcon(member.role)}
                {member.role}
              </div>
              {canManage && (
                <Button
                  onClick={() => handleRemoveMember(member.id, member.email, member.user?.name)}
                  disabled={deletingId === member.id}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {deletingId === member.id ? (
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
