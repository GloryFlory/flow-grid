import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import { requireFestivalAccess } from '@/lib/festival-access'
import { sendTeamInviteEmail } from '@/lib/email'
import { PLAN_FEATURES, type PlanType } from '@/types'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: festivalId } = await params
    const { email, role } = await req.json()

    // Validate input
    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      )
    }

    if (!['ADMIN', 'EDITOR', 'VIEWER'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be ADMIN, EDITOR, or VIEWER' },
        { status: 400 }
      )
    }

    // Check access - require manage team permission (OWNER or ADMIN role)
    const { error } = await requireFestivalAccess(festivalId, { requireManageTeam: true })
    if (error) return error

    // Check team member limits based on plan and get festival details
    const festivalData = await prisma.festival.findUnique({
      where: { id: festivalId },
      select: {
        name: true,
        logo: true,
        userId: true,
        _count: {
          select: {
            teamMembers: true, // Count all team members (including pending invites)
          },
        },
      },
    })

    if (!festivalData) {
      return NextResponse.json(
        { error: 'Festival not found' },
        { status: 404 }
      )
    }

    // Get owner's subscription plan
    const owner = await prisma.user.findUnique({
      where: { id: festivalData.userId },
      include: {
        subscription: true,
      },
    })

    const currentPlan = (owner?.subscription?.plan || 'FREE') as PlanType
    const planLimits = PLAN_FEATURES[currentPlan]
    const currentTeamCount = festivalData._count.teamMembers

    // Determine team member limit based on plan and Event Pass
    let teamMemberLimit = planLimits.teamMembersLimit
    
    if (currentPlan === 'FREE') {
      // FREE plan users get 0 team members by default
      teamMemberLimit = 0
      
      // If they have festivalsLimit > 1, they purchased an Event Pass
      // Event Pass grants 1 team member for the festival
      const festivalsLimit = owner?.subscription?.festivalsLimit || 1
      if (festivalsLimit > 1) {
        teamMemberLimit = 1
      }
    }

    // Check if adding another member would exceed the limit
    if (teamMemberLimit !== -1 && currentTeamCount >= teamMemberLimit) {
      const limitMessage = currentPlan === 'FREE' && teamMemberLimit === 0
        ? `Team members are not available on the FREE plan. Purchase an Event Pass to add 1 team member, or upgrade to PRO for up to 3 team members.`
        : `Team member limit reached. Your ${currentPlan} plan allows ${teamMemberLimit} team member${teamMemberLimit > 1 ? 's' : ''} (excluding the owner). You currently have ${currentTeamCount}. Upgrade to add more team members.`
      
      return NextResponse.json(
        {
          error: limitMessage,
          code: 'LIMIT_REACHED',
        },
        { status: 403 }
      )
    }

    // Check if user is trying to invite themselves
    if (email.toLowerCase() === session.user.email?.toLowerCase()) {
      return NextResponse.json(
        { error: 'You cannot invite yourself' },
        { status: 400 }
      )
    }

    // Check if this email is already invited or a member
    const existing = await prisma.teamMember.findFirst({
      where: {
        festivalId,
        email: email.toLowerCase(),
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'This email has already been invited to this festival' },
        { status: 400 }
      )
    }

    // Generate invite token
    const inviteToken = randomBytes(32).toString('hex')

    // Create team member invite
    const teamMember = await prisma.teamMember.create({
      data: {
        festivalId,
        email: email.toLowerCase(),
        role,
        inviteToken,
        invitedBy: session.user.id,
      },
    })

    // Send email invitation
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/team/accept/${inviteToken}`
    try {
      await sendTeamInviteEmail({
        to: email,
        festivalName: festivalData.name,
        festivalLogoUrl: festivalData.logo || undefined,
        inviterName: session.user.name || session.user.email || 'A team member',
        role,
        acceptUrl: inviteUrl,
      })
    } catch (emailError) {
      console.error('Failed to send invite email:', emailError)
      // Don't fail the request if email fails - the invite was created successfully
      // The user can still share the invite URL manually
    }

    return NextResponse.json({
      success: true,
      teamMember: {
        id: teamMember.id,
        email: teamMember.email,
        role: teamMember.role,
        invitedAt: teamMember.invitedAt,
      },
      inviteUrl, // Include this for testing/manual sharing if email fails
    })
  } catch (error) {
    console.error('Error creating team invite:', error)
    return NextResponse.json(
      { error: 'Failed to create team invite' },
      { status: 500 }
    )
  }
}
