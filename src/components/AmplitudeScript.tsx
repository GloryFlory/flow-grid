'use client'

import { useEffect } from 'react'
import Script from 'next/script'

export function AmplitudeScript() {
  const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY
  const serverZone = process.env.NEXT_PUBLIC_AMPLITUDE_SERVER_ZONE || 'EU'
  const enabledInDev = process.env.NEXT_PUBLIC_ENABLE_AMPLITUDE === 'true'
  const isProd = process.env.NODE_ENV === 'production'

  // Only load in production (or if explicitly enabled) and when key is present
  const shouldLoad = !!apiKey && (isProd || enabledInDev)

  useEffect(() => {
    if (!shouldLoad) return
    // Initialize amplitude after scripts load
    const initAmplitude = () => {
      try {
        if (typeof window !== 'undefined' && window.amplitude && window.amplitude.init) {
          // Session Replay plugin guarded if present
          if (window.sessionReplay && window.amplitude.add) {
            window.amplitude.add(window.sessionReplay.plugin({ sampleRate: 1 }))
          }
          window.amplitude.init(apiKey, {
            fetchRemoteConfig: true,
            serverZone,
            autocapture: true,
          })
        }
      } catch (e) {
        // Keep console noise low in dev; show debug only
        if (isProd) {
          console.warn('Amplitude init failed:', e)
        } else {
          console.debug('Amplitude init skipped/failed (dev):', e)
        }
      }
    }

    // Wait for amplitude to load
    if (document.readyState === 'complete') {
      initAmplitude()
    } else {
      window.addEventListener('load', initAmplitude)
      return () => window.removeEventListener('load', initAmplitude)
    }
  }, [shouldLoad, apiKey, serverZone, isProd])

  if (!shouldLoad) {
    return null
  }

  return (
    <>
      <Script 
        src={`https://cdn.${serverZone.toLowerCase()}.amplitude.com/script/${apiKey}.js`}
        strategy="afterInteractive"
      />
      <Script id="amplitude-setup" strategy="afterInteractive">
        {`
          window.amplitude = window.amplitude || { _q: [], _iq: {} };
          window.amplitude.add = window.amplitude.add || function(plugin) {
            window.amplitude._q = window.amplitude._q || [];
            window.amplitude._q.push(['add', plugin]);
          };
        `}
      </Script>
    </>
  )
}

declare global {
  interface Window {
    amplitude: any
    sessionReplay: any
  }
}
