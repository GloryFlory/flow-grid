import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { DashboardClient } from '@/components/DashboardClient'
import { DashboardWithPasskeySetup } from '@/components/DashboardWithPasskeySetup'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      webAuthnCredentials: {
        select: { id: true },
        take: 1,
      },
    }
  })
  
  if (!user) {
    redirect('/auth/signin')
  }

  const hasPasskey = user.webAuthnCredentials.length > 0

  // Ensure user.name is always a string for the client
  const clientUser = { ...user, name: user.name ?? user.email }
  
  return (
    <DashboardWithPasskeySetup 
      user={clientUser}
      hasPasskey={hasPasskey}
    >
      <DashboardClient user={clientUser} />
    </DashboardWithPasskeySetup>
  )
}