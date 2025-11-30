'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, List } from 'lucide-react'

interface TOCItem {
  id: string
  title: string
  level?: number
}

interface TableOfContentsProps {
  items: TOCItem[]
}

export default function TableOfContents({ items }: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(true)

  const handleClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <nav 
      aria-label="Table of contents"
      className="bg-gray-50 rounded-xl p-6 my-8 border border-gray-200"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <List className="w-5 h-5 text-gray-500" />
          <span className="font-semibold text-gray-900">Table of Contents</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      
      {isOpen && (
        <ol className="mt-4 space-y-2 list-decimal list-inside">
          {items.map((item, index) => (
            <li key={item.id} className="text-gray-600">
              <button
                onClick={() => handleClick(item.id)}
                className="text-blue-600 hover:text-blue-800 hover:underline text-left"
              >
                {item.title}
              </button>
            </li>
          ))}
        </ol>
      )}
    </nav>
  )
}
