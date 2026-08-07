import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Mail, Trash2, Crown, Shield, Edit, Eye, Lock, ArrowLeft } from 'lucide-react'
import TeamInviteForm from '@/components/TeamInviteForm'
import TeamMemberList from '@/components/TeamMemberList'
import PendingInvitesList from '@/components/PendingInvitesList'
import Link from 'next/link'

export const metadata = {
  title: 'Team Members',
  description: 'Manage who can access and edit your festival',
}

async function getFestivalWithTeam(festivalId: string, userId: string, userEmail: string, isSystemAdmin: boolean) {
  const festival = await prisma.festival.findFirst({
    where: {
      id: festivalId,
      ...(isSystemAdmin ? {} : {
        OR: [
          { userId }, // User is owner
          {
            teamMembers: {
              some: {
                email: userEmail,
                acceptedAt: { not: null } // User is accepted team member
              }
            }
          }
        ]
      })
    },
    include: {
      teamMembers: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  })

  return festival
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)
  const { id: festivalId } = await params

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      role: true,
      subscription: {
        select: {
          plan: true,
        }
      }
    }
  })

  if (!user) {
    redirect('/auth/signin')
  }

  const plan = user.subscription?.plan || 'FREE'
  const isAdmin = user.role === 'ADMIN'

  const festival = await getFestivalWithTeam(festivalId, session.user.id, user.email, isAdmin)

  if (!festival) {
    redirect('/dashboard')
  }

  // Get current user's role for this festival
  const isOwner = festival.userId === session.user.id
  const userMembership = festival.teamMembers.find(
    m => m.email === user.email && m.acceptedAt !== null
  )
  const userRole = isOwner ? 'OWNER' : (userMembership?.role || null)
  
  // Check permissions
  const canManageTeam = isOwner || isAdmin || userRole === 'ADMIN'
  
  // Monetisation is disabled — team collaboration is available to everyone.
  // Flat cap matches the invite API's spam backstop (invites send emails).
  const teamMemberLimit = 10
  const isPro = true

  const pendingInvites = festival.teamMembers.filter(m => !m.acceptedAt)
  const activeMembers = festival.teamMembers.filter(m => m.acceptedAt)
  
  // Count total team members (active + pending, excluding owner)
  const currentTeamCount = festival.teamMembers.length
  const canAddMore = currentTeamCount < teamMemberLimit

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

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-8">
      {/* Back Button */}
      <div>
        <Link href={`/dashboard/festivals/${festival.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Event
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Members</h1>
        <p className="text-gray-600">
          Collaborate with your team to manage {festival.name}
        </p>
      </div>

      {/* Role Explanations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Permission Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <Crown className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <div className="font-semibold text-yellow-900">Owner</div>
                <div className="text-sm text-yellow-700">
                  Full control including team management and billing
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <div className="font-semibold text-blue-900">Admin</div>
                <div className="text-sm text-blue-700">
                  Can manage team members and edit all content
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <Edit className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-semibold text-green-900">Editor</div>
                <div className="text-sm text-green-700">
                  Can edit sessions and teachers, cannot manage team
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <Eye className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <div className="font-semibold text-gray-900">Viewer</div>
                <div className="text-sm text-gray-700">
                  Read-only access to dashboard and analytics
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invite New Member */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Invite Team Member
            {!isPro && <Crown className="w-4 h-4 text-yellow-600 ml-1" />}
          </CardTitle>
          <CardDescription>
            {!canManageTeam
              ? 'Only the festival owner and admins can invite team members'
              : isPro 
                ? `Send an invitation to collaborate on this festival (${currentTeamCount}/${teamMemberLimit} team members)`
                : 'Upgrade to Pro to invite team members'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!canManageTeam ? (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Team Management Restricted
                  </h4>
                  <p className="text-sm text-gray-700">
                    Your role ({userRole}) doesn't have permission to manage team members. 
                    Contact the festival owner or an admin to invite or remove team members.
                  </p>
                </div>
              </div>
            </div>
          ) : !isPro ? (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Team Collaboration is a Pro Feature
                    </h4>
                    <p className="text-sm text-gray-700 mb-3">
                      Upgrade to Pro to invite up to 3 team members, or Enterprise for unlimited collaboration.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Link href="/pricing">
                        <Button size="sm" className="gap-2">
                          <Crown className="w-4 h-4" />
                          View Plans
                        </Button>
                      </Link>
                      <Link href={`/dashboard/festivals/${festival.id}/settings`}>
                        <Button size="sm" variant="outline">
                          Event Settings
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : !canAddMore ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Team Member Limit Reached
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    You've reached the limit of {teamMemberLimit} team members per festival.
                    Contact support if you need more.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <TeamInviteForm festivalId={festival.id} />
          )}
        </CardContent>
      </Card>

      {/* Owner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-600" />
            Festival Owner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {festival.user.avatar ? (
                <img
                  src={festival.user.avatar}
                  alt={festival.user.name || 'Owner'}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {festival.user.name?.[0]?.toUpperCase() || festival.user.email[0].toUpperCase()}
                </div>
              )}
              <div>
                <div className="font-medium text-gray-900">
                  {festival.user.name || 'Festival Owner'}
                </div>
                <div className="text-sm text-gray-600">{festival.user.email}</div>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor('OWNER')} flex items-center gap-2`}>
              {getRoleIcon('OWNER')}
              Owner
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Team Members */}
      {activeMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Active Team Members ({activeMembers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TeamMemberList
              members={activeMembers}
              festivalId={festival.id}
              canManage={canManageTeam}
            />
          </CardContent>
        </Card>
      )}

      {/* Pending Invitations */}
      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Pending Invitations ({pendingInvites.length})
            </CardTitle>
            <CardDescription>
              These people have been invited but haven't accepted yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PendingInvitesList
              invites={pendingInvites}
              festivalId={festival.id}
              canManage={canManageTeam}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
