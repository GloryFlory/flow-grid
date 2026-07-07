import Link from 'next/link'
import Image from 'next/image'

const navLinks = [
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'Help', href: '/help' },
  { label: 'Updates', href: '/updates' },
]

export default function MarketingNav() {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderBottom: '1px solid #eef0f3',
    }}>
      <div style={{
        maxWidth: 1160, margin: '0 auto', padding: '0 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 62,
        fontFamily: 'var(--font-space-grotesk), -apple-system, sans-serif',
      }}>
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: 9,
          fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em', color: '#0b0e14', textDecoration: 'none',
        }}>
          <Image src="/flow-grid-logo.png" alt="Flow Grid" width={27} height={27} style={{ borderRadius: 7 }} priority />
          Flow Grid
        </Link>

        <div className="hidden sm:flex" style={{ alignItems: 'center', gap: 26, fontSize: 14.5, fontWeight: 500 }}>
          {navLinks.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              style={{ color: '#3a3f4b', textDecoration: 'none' }}
              className="hover:text-[#0b0e14] transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link
            href="/auth/signin"
            className="hidden sm:block"
            style={{ fontWeight: 600, fontSize: 14.5, color: '#3a3f4b', textDecoration: 'none' }}
          >
            Log in
          </Link>
          <Link
            href="/auth/signin"
            style={{
              display: 'inline-flex', alignItems: 'center',
              fontWeight: 600, fontSize: 14.5, background: '#ff7119', color: '#fff',
              borderRadius: 9, padding: '9px 17px', textDecoration: 'none', transition: '.14s',
            }}
            className="hover:bg-[#d9440f]"
          >
            Start free
          </Link>
        </div>
      </div>
    </nav>
  )
}
