import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

export const runtime = 'edge'

export async function GET(request: Request) {
  // Verify this is a legitimate Vercel cron invocation
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    return NextResponse.json({ error: 'Redis not configured' }, { status: 500 })
  }

  const redis = new Redis({ url, token })
  const result = await redis.ping()

  return NextResponse.json({ ok: true, ping: result, ts: new Date().toISOString() })
}
