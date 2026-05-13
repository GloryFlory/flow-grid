'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface PageEntry {
  pageSlug: string
  title: string
  pageType: string
}

/**
 * /[slug]/register — index route.
 * Redirects to the only published page if there's exactly one,
 * or shows a list when there are multiple.
 */
export default function RegisterIndex() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()
  const [pages, setPages] = useState<PageEntry[] | null>(null)

  useEffect(() => {
    fetch(`/api/public/festivals/${slug}/register`)
      .then(r => r.json())
      .then(data => {
        const list: PageEntry[] = data.pages ?? []
        if (list.length === 1) {
          router.replace(`/${slug}/register/${list[0].pageSlug}`)
        } else {
          setPages(list)
        }
      })
      .catch(() => setPages([]))
  }, [slug, router])

  if (pages === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (pages.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">No signup pages available.</p>
      </div>
    )
  }

  // Multiple pages — show a simple list
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">Choose a signup page</h1>
        {pages.map(p => (
          <a
            key={p.pageSlug}
            href={`/${slug}/register/${p.pageSlug}`}
            className="block p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all"
          >
            <p className="font-semibold text-gray-900">{p.title}</p>
            <p className="text-xs text-gray-500 mt-0.5 capitalize">{p.pageType.toLowerCase().replace('_', ' ')}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
