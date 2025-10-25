import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin, Eye, Settings, Trash2, Plus, ExternalLink } from 'lucide-react'

export default async function FestivalsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // Fetch all festivals for the current user with session counts
  const festivals = await prisma.festival.findMany({
    where: { userId: session.user.id },
    include: {
      _count: {
        select: {
          sessions: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Festivals</h1>
            <p className="text-gray-600 mt-2">Manage your festival schedules and events</p>
          </div>
          <Link 
            href="/dashboard/create-festival"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Create Festival
          </Link>
        </div>

        {/* Festivals Grid */}
        {festivals.length === 0 ? (
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No festivals yet</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first festival schedule</p>
            <Link 
              href="/dashboard/create-festival"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Festival
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {festivals.map((festival) => (
              <div 
                key={festival.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Festival Header with Color Bar */}
                <div 
                  className="h-2" 
                  style={{ backgroundColor: festival.primaryColor || '#3b82f6' }}
                />
                
                <div className="p-6">
                  {/* Logo and Title */}
                  <div className="flex items-start gap-4 mb-4">
                    {festival.logo ? (
                      <Image 
                        src={festival.logo} 
                        alt={festival.name}
                        width={60}
                        height={60}
                        className="rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-15 h-15 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-8 h-8 text-white" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-xl font-bold text-gray-900 truncate">
                          {festival.name}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                          festival.isPublished 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {festival.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {festival.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {festival.description}
                    </p>
                  )}

                  {/* Meta Information */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(festival.startDate).toLocaleDateString()} - {new Date(festival.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    {festival.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{festival.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4 mb-4 pb-4 border-b">
                    <div className="text-center flex-1">
                      <div className="text-2xl font-bold text-gray-900">
                        {festival._count.sessions}
                      </div>
                      <div className="text-xs text-gray-600">Sessions</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/festivals/${festival.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Manage
                    </Link>
                    {festival.isPublished && (
                      <Link
                        href={`/${festival.slug}/schedule`}
                        target="_blank"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
