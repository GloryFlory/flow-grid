import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('[Logo Upload] Starting upload process...')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('[Logo Upload] Unauthorized - no session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Logo Upload] User authenticated:', session.user.id)

    const formData = await request.formData()
    const file = formData.get('logo') as File
    const festivalId = formData.get('festivalId') as string

    console.log('[Logo Upload] File received:', file?.name, 'Size:', file?.size)
    console.log('[Logo Upload] Festival ID:', festivalId)

    if (!file || !festivalId) {
      console.log('[Logo Upload] Missing file or festival ID')
      return NextResponse.json({ error: 'Missing file or festival ID' }, { status: 400 })
    }

    // Verify festival ownership
    const festival = await prisma.festival.findFirst({
      where: {
        id: festivalId,
        userId: session.user.id,
      },
    })

    if (!festival) {
      console.log('[Logo Upload] Festival not found or unauthorized')
      return NextResponse.json({ error: 'Festival not found' }, { status: 404 })
    }

    console.log('[Logo Upload] Festival verified:', festival.name)

    // Check Supabase credentials
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      console.error('[Logo Upload] Missing Supabase credentials!')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Delete old logo if exists
    if (festival.logo) {
      const oldPath = festival.logo.split('/').pop()
      if (oldPath) {
        console.log('[Logo Upload] Deleting old logo:', oldPath)
        await supabase.storage.from('festival-logo').remove([oldPath])
      }
    }

    // Upload new logo
    const fileExt = file.name.split('.').pop()
    const fileName = `${festivalId}-${Date.now()}.${fileExt}`
    const fileBuffer = await file.arrayBuffer()

    console.log('[Logo Upload] Uploading to Supabase:', fileName)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('festival-logo')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('[Logo Upload] Supabase upload error:', uploadError)
      return NextResponse.json({ 
        error: 'Failed to upload logo', 
        details: uploadError.message 
      }, { status: 500 })
    }

    console.log('[Logo Upload] Upload successful:', uploadData)

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('festival-logo')
      .getPublicUrl(fileName)

    console.log('[Logo Upload] Public URL:', publicUrl)

    // Update festival with logo URL
    await prisma.festival.update({
      where: { id: festivalId },
      data: { logo: publicUrl },
    })

    console.log('[Logo Upload] Database updated successfully')

    return NextResponse.json({ 
      success: true,
      logoPath: publicUrl 
    })
  } catch (error) {
    console.error('[Logo Upload] Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
