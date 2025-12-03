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
    console.log('[Font Upload] Starting upload process...')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('[Font Upload] Unauthorized - no session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Font Upload] User authenticated:', session.user.id)

    const formData = await request.formData()
    const file = formData.get('font') as File
    const festivalId = formData.get('festivalId') as string
    const fontName = formData.get('fontName') as string

    console.log('[Font Upload] File received:', file?.name, 'Size:', file?.size)
    console.log('[Font Upload] Festival ID:', festivalId)
    console.log('[Font Upload] Font name:', fontName)

    if (!file || !festivalId) {
      console.log('[Font Upload] Missing file or festival ID')
      return NextResponse.json({ error: 'Missing file or festival ID' }, { status: 400 })
    }

    // Validate file type
    const validTypes = ['font/ttf', 'font/otf', 'font/woff', 'font/woff2', 'application/x-font-ttf', 'application/x-font-otf', 'application/font-woff', 'application/font-woff2']
    // Some browsers report font files with generic types
    const isValidFont = validTypes.includes(file.type) || 
      file.name.endsWith('.ttf') || 
      file.name.endsWith('.otf') || 
      file.name.endsWith('.woff') || 
      file.name.endsWith('.woff2')
    
    if (!isValidFont) {
      console.log('[Font Upload] Invalid file type:', file.type)
      return NextResponse.json({ error: 'Invalid font file type. Supported: TTF, OTF, WOFF, WOFF2' }, { status: 400 })
    }

    // Verify festival ownership
    const festival = await prisma.festival.findFirst({
      where: {
        id: festivalId,
        userId: session.user.id,
      },
    })

    if (!festival) {
      console.log('[Font Upload] Festival not found or unauthorized')
      return NextResponse.json({ error: 'Festival not found' }, { status: 404 })
    }

    console.log('[Font Upload] Festival verified:', festival.name)

    // Check Supabase credentials
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      console.error('[Font Upload] Missing Supabase credentials!')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Delete old custom font if exists
    const currentFont = (festival as any).headerFont
    if (currentFont && currentFont.startsWith('custom:')) {
      // Extract the old file path from the URL
      const oldFontUrl = currentFont.replace('custom:', '')
      if (oldFontUrl.includes('custom-fonts/')) {
        const oldPath = oldFontUrl.split('custom-fonts/').pop()
        if (oldPath) {
          console.log('[Font Upload] Deleting old font:', oldPath)
          await supabase.storage.from('custom-fonts').remove([oldPath])
        }
      }
    }

    // Upload new font
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'ttf'
    const sanitizedName = (fontName || file.name.replace(/\.[^/.]+$/, ''))
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .substring(0, 50)
    const fileName = `${festivalId}/${sanitizedName}-${Date.now()}.${fileExt}`
    const fileBuffer = await file.arrayBuffer()

    console.log('[Font Upload] Uploading to Supabase:', fileName)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('custom-fonts')
      .upload(fileName, fileBuffer, {
        contentType: file.type || 'font/ttf',
        upsert: true,
      })

    if (uploadError) {
      console.error('[Font Upload] Supabase upload error:', uploadError)
      return NextResponse.json({ 
        error: 'Failed to upload font', 
        details: uploadError.message 
      }, { status: 500 })
    }

    console.log('[Font Upload] Upload successful:', uploadData)

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('custom-fonts')
      .getPublicUrl(fileName)

    console.log('[Font Upload] Public URL:', publicUrl)

    // The display name for the font
    const displayName = fontName || file.name.replace(/\.[^/.]+$/, '')

    // Update festival with font info (store as "custom:fontName|url")
    const fontValue = `custom:${displayName}|${publicUrl}`
    await prisma.festival.update({
      where: { id: festivalId },
      data: { headerFont: fontValue },
    })

    console.log('[Font Upload] Festival updated with font:', fontValue)

    return NextResponse.json({ 
      success: true, 
      fontUrl: publicUrl,
      fontName: displayName,
      headerFont: fontValue
    })

  } catch (error) {
    console.error('[Font Upload] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
