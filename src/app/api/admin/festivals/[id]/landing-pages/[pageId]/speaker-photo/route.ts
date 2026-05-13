import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireFestivalAccess } from '@/lib/festival-access'
import { createClient } from '@supabase/supabase-js'

// POST /api/admin/festivals/[id]/landing-pages/[pageId]/speaker-photo
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string }> }
) {
  try {
    const { id: festivalId, pageId } = await params

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
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. JPG, PNG, WebP or GIF only.' }, { status: 400 })
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum 5MB.' }, { status: 400 })
    }

    const existing = await prisma.landingPage.findFirst({
      where: { id: pageId, festivalId },
      select: { speakerPhoto: true },
    })
    if (!existing) return NextResponse.json({ error: 'Page not found' }, { status: 404 })

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

    // Delete old photo
    if (existing.speakerPhoto) {
      const oldPath = existing.speakerPhoto.split('/').pop()
      if (oldPath?.startsWith('speaker-')) {
        await supabase.storage.from('teachers').remove([oldPath])
      }
    }

    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `speaker-${pageId}-${Date.now()}.${ext}`
    const buffer = await file.arrayBuffer()

    const { error: uploadError } = await supabase.storage
      .from('teachers')
      .upload(filename, buffer, { contentType: file.type, upsert: true })

    if (uploadError) {
      console.error('Speaker photo upload error:', uploadError)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage.from('teachers').getPublicUrl(filename)

    await prisma.landingPage.update({
      where: { id: pageId },
      data: { speakerPhoto: publicUrl },
    })

    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error('Error uploading speaker photo:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
