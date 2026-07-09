import type { Metadata } from 'next'
import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import ScheduleClient from './ScheduleClient'

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params

  const festival = await prisma.festival.findUnique({
    where: { slug },
    select: { name: true, description: true, logo: true, startDate: true, endDate: true, location: true, primaryColor: true },
  })

  if (!festival) {
    return { title: 'Schedule Not Found' }
  }

  const description = festival.description?.trim()
    || `Browse the full programme for ${festival.name}. Filter sessions by teacher, level, or time slot.`

  // Pass all data as query params so the OG route needs no DB access at all
  const ogParams = new URLSearchParams({
    name: festival.name,
    start: festival.startDate.toISOString(),
    end: festival.endDate.toISOString(),
    color: festival.primaryColor ?? '#ff7119',
    ...(festival.logo ? { logo: festival.logo } : {}),
  })
  const ogImage = `https://tryflowgrid.com/api/og?${ogParams.toString()}`

  return {
    title: festival.name,
    description,
    openGraph: {
      title: `${festival.name} — Full Schedule`,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${festival.name} schedule` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${festival.name} — Full Schedule`,
      description,
      images: [ogImage],
    },
  }
}

export default function SchedulePage() {
  return (
    <Suspense>
      <ScheduleClient />
    </Suspense>
  )
}
