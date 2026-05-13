import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import RoomBuilderClient from '@/components/retreat/RoomBuilderClient'

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

export default async function FestivalRoomsPage({
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

  return <RoomBuilderClient festivalId={festival.id} festivalName={festival.name} />
}
