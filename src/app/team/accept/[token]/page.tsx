import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, UserPlus, XCircle } from 'lucide-react'
import Link from 'next/link'

async function getInvite(token: string) {
  const invite = await prisma.teamMember.findFirst({
    where: {
      inviteToken: token,
      acceptedAt: null, // Only pending invites
    },
    include: {
      festival: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  })

  return invite
}

async function acceptInvite(token: string, userId: string, userEmail: string) {
  const invite = await prisma.teamMember.findFirst({
    where: {
      inviteToken: token,
      acceptedAt: null,
    },
  })

  if (!invite) {
    return null
  }

  // Verify email matches (case insensitive)
  if (invite.email.toLowerCase() !== userEmail.toLowerCase()) {
    throw new Error('This invite was sent to a different email address')
  }

  // Accept the invite
  const updated = await prisma.teamMember.update({
    where: {
      id: invite.id,
    },
    data: {
      userId,
      acceptedAt: new Date(),
      inviteToken: null, // Clear token after acceptance
    },
    include: {
      festival: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  })

  return updated
}

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const session = await getServerSession(authOptions)
  const { token } = await params

  // If not logged in, redirect to sign in with return URL
  if (!session?.user?.id) {
    redirect(`/auth/signin?callbackUrl=/team/accept/${token}`)
  }

  const invite = await getInvite(token)

  // Invalid or already accepted invite
  if (!invite) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <CardTitle>Invalid Invitation</CardTitle>
                <CardDescription>This invitation link is not valid</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              This invitation may have already been accepted or has expired.
            </p>
            <Link href="/dashboard">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if user is trying to accept their own invitation
  if (invite.invitedBy === session.user.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <CardTitle>Cannot Accept Own Invitation</CardTitle>
                <CardDescription>You sent this invitation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              You cannot accept an invitation that you sent yourself. This invitation is for{' '}
              <strong>{invite.email}</strong>.
            </p>
            <Link href="/dashboard">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if email matches logged-in user
  const emailMatches = invite.email.toLowerCase() === session.user.email?.toLowerCase()

  if (!emailMatches) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <CardTitle>Email Mismatch</CardTitle>
                <CardDescription>Wrong account</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              This invitation was sent to <strong>{invite.email}</strong>, but you're logged in as{' '}
              <strong>{session.user.email}</strong>.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Please sign out and sign in with the invited email address.
            </p>
            <div className="flex gap-3">
              <Link href="/auth/signout" className="flex-1">
                <Button variant="outline" className="w-full">
                  Sign Out
                </Button>
              </Link>
              <Link href="/dashboard" className="flex-1">
                <Button className="w-full">Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Accept the invite
  try {
    const accepted = await acceptInvite(token, session.user.id, session.user.email!)

    if (!accepted) {
      throw new Error('Failed to accept invite')
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <CardTitle>Invitation Accepted!</CardTitle>
                <CardDescription>You're now part of the team</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <UserPlus className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900 mb-1">{accepted.festival.name}</p>
                  <p className="text-sm text-blue-700">
                    You've been added as a <strong>{accepted.role}</strong>
                  </p>
                </div>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              You can now access and manage this festival from your dashboard.
            </p>
            <Link href={`/dashboard/festivals/${accepted.festival.id}`}>
              <Button className="w-full">Go to Festival Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error('Error accepting invite:', error)

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <CardTitle>Error</CardTitle>
                <CardDescription>Could not accept invitation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              {error instanceof Error ? error.message : 'Something went wrong. Please try again.'}
            </p>
            <Link href="/dashboard">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }
}
