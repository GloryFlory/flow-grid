import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import GuestOpsHubClient from '@/components/retreat/GuestOpsHubClient'

async function getFestivalForUser(festivalId: string, userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  })

  if (!user) return null

  return prisma.festival.findFirst({
    where: {
      id: festivalId,
      OR: [
        { userId },
        {
          teamMembers: {
            some: {
              email: user.email,
              acceptedAt: { not: null },
            },
          },
        },
      ],
    },
    select: {
      id: true,
      name: true,
    },
  })
}

export default async function FestivalGuestsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)
  const { id: festivalId } = await params

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const festival = await getFestivalForUser(festivalId, session.user.id)

  if (!festival) {
    redirect('/dashboard')
  }

  return <GuestOpsHubClient festivalId={festival.id} festivalName={festival.name} />
}
