import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
// Lazy-load supabase client at runtime
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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const form = await req.formData()
    const name = form.get('name') as string | null
    const url = form.get('url') as string | null
    const file = form.get('file') as File | null

    // Get current teacher to check if name is actually changing
    const currentTeacher = await prisma.teacher.findUnique({ where: { id } })
    if (!currentTeacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // If name is being changed, check for duplicates in the same festival (excluding current teacher)
    if (name && name.trim() && name.trim() !== currentTeacher.name) {
      const existing = await prisma.teacher.findFirst({
        where: {
          festivalId: currentTeacher.festivalId,
          name: name.trim()
        }
      })
      
      if (existing) {
        return NextResponse.json({ error: 'Teacher with this name already exists in this festival' }, { status: 409 })
      }
    }

    const updateData: any = {}
    if (name) updateData.name = name.trim()
    updateData.url = url || undefined

    const teacher = await prisma.teacher.update({ where: { id }, data: updateData })

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
    console.error('Error updating teacher:', error)
    return NextResponse.json({ error: 'Failed to update teacher' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    // Delete the teacher (photos are matched by teacherName, not FK)
    await prisma.teacher.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting teacher:', error)
    return NextResponse.json({ error: 'Failed to delete teacher' }, { status: 500 })
  }
}
