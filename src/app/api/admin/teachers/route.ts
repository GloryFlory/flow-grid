import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Dynamically import supabase client at runtime to avoid build-time failures when package or keys are missing
async function getSupabaseClient() {
  try {
    const mod = await import('@supabase/supabase-js')
    const { createClient } = mod
    const url = process.env.SUPABASE_URL || ''
    const key = process.env.SUPABASE_SERVICE_KEY || ''
    if (!url || !key) return null
    return createClient(url, key)
  } catch (err) {
    console.warn('Supabase client not available:', err)
    return null
  }
}

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const name = form.get('name') as string | null
    const url = form.get('url') as string | null
    const festivalId = form.get('festivalId') as string | null
    const file = form.get('file') as File | null

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    if (!festivalId) {
      return NextResponse.json({ error: 'Festival ID is required' }, { status: 400 })
    }

    // Check if teacher already exists in this festival
    const existing = await prisma.teacher.findFirst({ 
      where: { 
        festivalId,
        name: name.trim() 
      } 
    })
    if (existing) {
      return NextResponse.json({ error: 'Teacher with this name already exists in this festival' }, { status: 400 })
    }

    // create teacher
    const teacher = await prisma.teacher.create({ 
      data: { 
        festivalId,
        name: name.trim(), 
        url: url || undefined
      } 
    })

    // handle file if present via Supabase Storage
    if (file) {
      const supabase = await getSupabaseClient()
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const originalName = (file as any).name || `photo-${Date.now()}`
      const ext = originalName.split('.').pop() || 'jpg'
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      
      if (!supabase) {
        console.warn('Skipping upload: Supabase client or keys not configured')
      } else {
        const { data, error } = await supabase.storage
          .from('teachers')
          .upload(filename, buffer, { contentType: (file as any).type })

        if (error) {
          console.error('Supabase upload error:', error)
        } else {
          // Get public URL
          const { data: { publicUrl } } = supabase.storage.from('teachers').getPublicUrl(filename)

          // Create photo record with teacherName for backward compatibility
          await prisma.teacherPhoto.create({
            data: {
              filename,
              teacherName: teacher.name,
              filePath: publicUrl,
              fileSize: buffer.length,
              mimeType: (file as any).type || 'application/octet-stream',
            },
          })
        }
      }
    }

    return NextResponse.json({ teacher })
  } catch (error) {
    console.error('Error creating teacher:', error)
    return NextResponse.json({ error: 'Failed to create teacher' }, { status: 500 })
  }
}