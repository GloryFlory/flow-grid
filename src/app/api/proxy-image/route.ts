import { NextRequest, NextResponse } from 'next/server'
import dns from 'dns/promises'
import net from 'net'

// Node runtime required for dns/net.
export const runtime = 'nodejs'

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

/**
 * Reject IPs that point at private, loopback, link-local, or otherwise
 * internal ranges. This is what stops the endpoint being used as an SSRF
 * pivot into cloud metadata / internal services.
 */
function isBlockedIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number)
    if (a === 0) return true // "this" network
    if (a === 10) return true // private
    if (a === 127) return true // loopback
    if (a === 169 && b === 254) return true // link-local + cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true // private
    if (a === 192 && b === 168) return true // private
    if (a === 100 && b >= 64 && b <= 127) return true // CGNAT
    if (a >= 224) return true // multicast / reserved
    return false
  }

  const lower = ip.toLowerCase()
  if (lower === '::1' || lower === '::') return true // loopback / unspecified
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true // unique local
  if (lower.startsWith('fe80')) return true // link-local
  // IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1)
  if (lower.startsWith('::ffff:')) return isBlockedIp(lower.replace('::ffff:', ''))
  return false
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL parameter required' }, { status: 400 })
  }

  // 1. Parse + enforce scheme
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return NextResponse.json({ error: 'Only http(s) URLs are allowed' }, { status: 400 })
  }

  // 2. Resolve host and block internal addresses
  try {
    const { address } = await dns.lookup(parsed.hostname)
    if (isBlockedIp(address)) {
      return NextResponse.json({ error: 'Destination not allowed' }, { status: 403 })
    }
  } catch {
    return NextResponse.json({ error: 'Could not resolve host' }, { status: 400 })
  }

  try {
    // 3. Fetch. Disallow redirects so a public URL can't 3xx-bounce to an
    //    internal one after the DNS check (a common SSRF bypass).
    const response = await fetch(parsed.toString(), { redirect: 'error' })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: response.status })
    }

    // 4. Only proxy actual images, and cap the size.
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'URL is not an image' }, { status: 400 })
    }

    const declaredLength = Number(response.headers.get('content-length') || 0)
    if (declaredLength && declaredLength > MAX_BYTES) {
      return NextResponse.json({ error: 'Image too large' }, { status: 413 })
    }

    const buffer = await response.arrayBuffer()
    if (buffer.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: 'Image too large' }, { status: 413 })
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType || 'image/png',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Image proxy error:', error)
    return NextResponse.json({ error: 'Failed to proxy image' }, { status: 500 })
  }
}
