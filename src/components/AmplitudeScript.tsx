'use client'

import { useEffect } from 'react'
import Script from 'next/script'

export function AmplitudeScript() {
  useEffect(() => {
    // Initialize amplitude after scripts load
    const initAmplitude = () => {
      if (typeof window !== 'undefined' && window.amplitude && window.amplitude.init && window.sessionReplay) {
        window.amplitude.add(window.sessionReplay.plugin({ sampleRate: 1 }))
        window.amplitude.init('46325823b94e297568aa8e2ee0361dd7', {
          fetchRemoteConfig: true,
          serverZone: 'EU',
          autocapture: true
        })
      }
    }

    // Wait for amplitude to load
    if (document.readyState === 'complete') {
      initAmplitude()
    } else {
      window.addEventListener('load', initAmplitude)
      return () => window.removeEventListener('load', initAmplitude)
    }
  }, [])

  return (
    <>
      <Script 
        src="https://cdn.eu.amplitude.com/script/46325823b94e297568aa8e2ee0361dd7.js"
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
