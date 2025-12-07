import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export type FestivalRole = 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER'

export interface FestivalAccess {
  hasAccess: boolean
  role: FestivalRole | null
  isOwner: boolean
  isAdmin: boolean
  isTeamMember: boolean
  canEdit: boolean
  canManageTeam: boolean
  canManageSettings: boolean
  canDelete: boolean
}

/**
 * Check if a user has access to a festival and what their role is
 */
export async function checkFestivalAccess(
  festivalId: string,
  userId: string,
  userRole?: string
): Promise<FestivalAccess> {
  // Get user's email for team membership check
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true }
  })

  if (!user) {
    return {
      hasAccess: false,
      role: null,
      isOwner: false,
      isAdmin: false,
      isTeamMember: false,
      canEdit: false,
      canManageTeam: false,
      canManageSettings: false,
      canDelete: false
    }
  }

  // Get festival with owner and team members
  const festival = await prisma.festival.findUnique({
    where: { id: festivalId },
    select: {
      userId: true,
      teamMembers: {
        where: {
          OR: [
            { userId: userId, acceptedAt: { not: null } },
            { email: user.email, acceptedAt: { not: null } }
          ]
        },
        select: {
          role: true
        }
      }
    }
  })

  if (!festival) {
    return {
      hasAccess: false,
      role: null,
      isOwner: false,
      isAdmin: false,
      isTeamMember: false,
      canEdit: false,
      canManageTeam: false,
      canManageSettings: false,
      canDelete: false
    }
  }

  const isOwner = festival.userId === userId
  const isSystemAdmin = userRole === 'ADMIN'
  const teamMember = festival.teamMembers[0]
  const isTeamMember = !!teamMember
  
  let role: FestivalRole | null = null
  if (isOwner) {
    role = 'OWNER'
  } else if (isTeamMember) {
    role = teamMember.role as FestivalRole
  }

  const hasAccess = isOwner || isSystemAdmin || isTeamMember
  const canEdit = isOwner || isSystemAdmin || ['ADMIN', 'EDITOR'].includes(role || '')
  const canManageTeam = isOwner || isSystemAdmin || role === 'ADMIN'
  const canManageSettings = isOwner || isSystemAdmin || role === 'ADMIN'
  const canDelete = isOwner || isSystemAdmin

  return {
    hasAccess,
    role,
    isOwner,
    isAdmin: isSystemAdmin,
    isTeamMember,
    canEdit,
    canManageTeam,
    canManageSettings,
    canDelete
  }
}

/**
 * Middleware-style function to check festival access in API routes
 * Returns NextResponse with error if no access, or null if access granted
 */
export async function requireFestivalAccess(
  festivalId: string,
  options: {
    requireEdit?: boolean
    requireManageTeam?: boolean
    requireManageSettings?: boolean
    requireOwner?: boolean
  } = {}
): Promise<{ access: FestivalAccess; error: NextResponse | null }> {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return {
      access: {
        hasAccess: false,
        role: null,
        isOwner: false,
        isAdmin: false,
        isTeamMember: false,
        canEdit: false,
        canManageTeam: false,
        canManageSettings: false,
        canDelete: false
      },
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const access = await checkFestivalAccess(
    festivalId,
    session.user.id,
    (session.user as any).role
  )

  if (!access.hasAccess) {
    return {
      access,
      error: NextResponse.json(
        { error: 'Festival not found or access denied' },
        { status: 403 }
      )
    }
  }

  if (options.requireOwner && !access.isOwner && !access.isAdmin) {
    return {
      access,
      error: NextResponse.json(
        { error: 'Only the festival owner can perform this action' },
        { status: 403 }
      )
    }
  }

  if (options.requireManageSettings && !access.canManageSettings) {
    return {
      access,
      error: NextResponse.json(
        { error: 'You do not have permission to manage festival settings' },
        { status: 403 }
      )
    }
  }

  if (options.requireManageTeam && !access.canManageTeam) {
    return {
      access,
      error: NextResponse.json(
        { error: 'You do not have permission to manage team members' },
        { status: 403 }
      )
    }
  }

  if (options.requireEdit && !access.canEdit) {
    return {
      access,
      error: NextResponse.json(
        { error: 'You do not have permission to edit this festival. Your role is view-only.' },
        { status: 403 }
      )
    }
  }

  return { access, error: null }
}
