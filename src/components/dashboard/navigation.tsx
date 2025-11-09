'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Home, 
  Settings, 
  LogOut,
  User,
  BarChart3,
  Shield,
  HelpCircle,
  ExternalLink,
  Mail
} from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

export function DashboardNavigation() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [showHelpDropdown, setShowHelpDropdown] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Festivals', href: '/dashboard/festivals', icon: Calendar },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]

  const helpLinks = [
    { 
      name: 'User Guide', 
      href: 'https://github.com/GloryFlory/flow-grid/blob/main/USER_GUIDE.md',
      icon: ExternalLink 
    },
    { 
      name: 'Glossary', 
      href: 'https://github.com/GloryFlory/flow-grid/blob/main/GLOSSARY.md',
      icon: ExternalLink 
    },
    { 
      name: 'Contact Support', 
      href: 'mailto:support@tryflowgrid.com',
      icon: Mail 
    },
  ]

  // Add Platform link for admins
  const adminNavigation = session?.user?.role === 'ADMIN' 
    ? [{ name: 'Platform', href: '/dashboard/platform', icon: Shield }]
    : []

  const allNavigation = [...navigation, ...adminNavigation]

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3">
              <Image 
                src="/flow-grid-logo.png" 
                alt="Flow Grid" 
                width={120} 
                height={32}
                className="h-6 sm:h-8 w-auto"
              />
              <span className="text-lg sm:text-xl font-semibold text-gray-900 hidden sm:block">Flow Grid</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {allNavigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Link>
              )
            })}
            
            {/* Help Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowHelpDropdown(!showHelpDropdown)}
                onBlur={() => setTimeout(() => setShowHelpDropdown(false), 200)}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Help
              </button>
              
              {showHelpDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  {helpLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                      rel={link.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <link.icon className="w-4 h-4 mr-3 text-gray-400" />
                      {link.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              <User className="w-4 h-4 mr-2" />
              <span className="max-w-[150px] truncate">{session?.user?.name || session?.user?.email}</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Mobile Sign Out Button */}
          <div className="md:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t bg-gray-50">
        <div className="px-2 py-2">
          <div className={`grid ${allNavigation.length > 4 ? 'grid-cols-5' : 'grid-cols-5'} gap-1`}>
            {allNavigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center justify-center px-2 py-2 rounded-md text-xs font-medium ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5 mb-1" />
                  <span className="truncate w-full text-center">{item.name}</span>
                </Link>
              )
            })}
            
            {/* Mobile Help Button */}
            <button
              onClick={() => setShowHelpDropdown(!showHelpDropdown)}
              className="flex flex-col items-center justify-center px-2 py-2 rounded-md text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 relative"
            >
              <HelpCircle className="w-5 h-5 mb-1" />
              <span className="truncate w-full text-center">Help</span>
              
              {showHelpDropdown && (
                <div 
                  className="absolute bottom-full right-0 mb-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  {helpLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                      rel={link.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowHelpDropdown(false)}
                    >
                      <link.icon className="w-4 h-4 mr-3 text-gray-400" />
                      {link.name}
                    </a>
                  ))}
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}