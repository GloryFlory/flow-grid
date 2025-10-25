import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { pipeline } from 'stream/promises'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'teachers')

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
    const originalName = (file as any).name || 'upload'
    const ext = path.extname(originalName)
    const filename = `${Date.now()}-${crypto.randomUUID()}${ext}`
    const destPath = path.join(UPLOAD_DIR, filename)
    const stream = (file as any).stream()
    await pipeline(stream, fs.createWriteStream(destPath))
    const stats = fs.statSync(destPath)
    const filePath = `/uploads/teachers/${filename}`

    return NextResponse.json({ filename, filePath, fileSize: stats.size })
  } catch (error) {
    console.error('Error uploading photo:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
