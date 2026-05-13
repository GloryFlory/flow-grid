'use client'
import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

/** Redirect: old single landing-page URL → new multi-page list */
export default function LandingPageRedirect() {
  const params = useParams()
  const router = useRouter()
  useEffect(() => {
    router.replace(`/dashboard/festivals/${params.id}/landing-pages`)
  }, [params.id, router])
  return null
}
