import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireFestivalAccess } from '@/lib/festival-access'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { id: festivalId, memberId } = await params

    // Check access - require manage team permission (OWNER or ADMIN role)
    const { error } = await requireFestivalAccess(festivalId, { requireManageTeam: true })
    if (error) return error

    // Find and delete the team member
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        id: memberId,
        festivalId,
      },
    })

    if (!teamMember) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      )
    }

    await prisma.teamMember.delete({
      where: {
        id: memberId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing team member:', error)
    return NextResponse.json(
      { error: 'Failed to remove team member' },
      { status: 500 }
    )
  }
}
