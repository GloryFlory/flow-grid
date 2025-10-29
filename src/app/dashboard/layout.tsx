import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { DashboardNavigation } from '@/components/dashboard/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  console.log('🏠 Dashboard layout - session check:', { 
    hasSession: !!session, 
    user: session?.user?.email,
    sessionData: session 
  })

  if (!session) {
    console.log('🏠 No session found, redirecting to signin')
    redirect('/auth/signin')
  }

  console.log('🏠 Session found, rendering dashboard')
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavigation />
      {children}
    </div>
  )
}