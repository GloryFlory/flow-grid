'use client'

import { useEffect } from 'react'

// Fires once after login to link any pending fg_ref cookie to this user.
export function AffiliateClaimer() {
  useEffect(() => {
    const key = 'fg_claim_attempted'
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
    fetch('/api/affiliate/claim', { method: 'POST' }).catch(() => {})
  }, [])

  return null
}
