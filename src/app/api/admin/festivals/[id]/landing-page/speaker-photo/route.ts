import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'
import { requireFestivalAccess } from '@/lib/festival-access'

// POST /api/admin/festivals/[id]/landing-page/speaker-photo
// Uploads a speaker photo to Supabase storage and updates the landing page record
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: festivalId } = await params

    const { error, access } = await requireFestivalAccess(festivalId)
    if (error) return error
    if (!access.canEdit) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get('photo') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. JPG, PNG, WebP or GIF only.' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum 5MB.' }, { status: 400 })
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `speaker-${festivalId}-${Date.now()}.${ext}`
    const buffer = await file.arrayBuffer()

    // Delete old speaker photo if it exists
    const existing = await prisma.landingPage.findFirst({
      where: { festivalId },
      select: { speakerPhoto: true }
    })
    if (existing?.speakerPhoto) {
      const oldPath = existing.speakerPhoto.split('/').pop()
      if (oldPath?.startsWith('speaker-')) {
        await supabase.storage.from('teachers').remove([oldPath])
      }
    }

    const { error: uploadError } = await supabase.storage
      .from('teachers')
      .upload(filename, buffer, { contentType: file.type, upsert: true })

    if (uploadError) {
      console.error('Speaker photo upload error:', uploadError)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage.from('teachers').getPublicUrl(filename)

    // Update the landing page record with the new photo URL
    const existingPage = await prisma.landingPage.findFirst({ where: { festivalId }, select: { id: true } })
    if (existingPage) {
      await prisma.landingPage.update({ where: { id: existingPage.id }, data: { speakerPhoto: publicUrl } })
    } else {
      await prisma.landingPage.create({
        data: { festivalId, pageType: 'WEBINAR', pageSlug: 'webinar', title: 'Webinar Signup', headline: 'My Webinar', speakerPhoto: publicUrl },
      })
    }
    })

    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error('Error uploading speaker photo:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
