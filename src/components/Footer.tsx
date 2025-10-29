import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Image 
                src="/flow-grid-logo.png" 
                alt="Flow Grid" 
                width={32} 
                height={32}
                className="h-8 w-auto"
              />
              <span className="ml-3 text-xl font-bold text-white">Flow Grid</span>
            </div>
            <p className="text-gray-400">
              The complete solution for festival and retreat scheduling.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link href="/flow-grid-demo/schedule" className="hover:text-white transition-colors">View Demo</Link></li>
              <li><Link href="/glossary" className="hover:text-white transition-colors">Glossary</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p>&copy; 2025 Flow Grid. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}