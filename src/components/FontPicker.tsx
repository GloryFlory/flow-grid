'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Check, ChevronDown, Upload, Loader2 } from 'lucide-react'

// Preset fonts that are already loaded in the app
const PRESET_FONTS = [
  { name: 'Default', value: '', category: 'preset' },
  { name: 'Domine', value: 'var(--font-domine)', category: 'preset' },
  { name: 'Lora', value: 'var(--font-lora)', category: 'preset' },
  { name: 'Space Grotesk', value: 'var(--font-space-grotesk)', category: 'preset' },
  { name: 'Metamorphous', value: 'var(--font-metamorphous)', category: 'preset' },
  { name: 'Henny Penny', value: 'var(--font-henny-penny)', category: 'preset' },
  { name: 'Italianno', value: 'var(--font-italianno)', category: 'preset' },
]

// Comprehensive list of 200+ popular Google Fonts organized by category
const GOOGLE_FONTS: { family: string; category: string }[] = [
  // Sans-serif fonts (most popular)
  { family: 'Roboto', category: 'sans-serif' },
  { family: 'Open Sans', category: 'sans-serif' },
  { family: 'Lato', category: 'sans-serif' },
  { family: 'Montserrat', category: 'sans-serif' },
  { family: 'Poppins', category: 'sans-serif' },
  { family: 'Inter', category: 'sans-serif' },
  { family: 'Raleway', category: 'sans-serif' },
  { family: 'Nunito', category: 'sans-serif' },
  { family: 'Nunito Sans', category: 'sans-serif' },
  { family: 'Work Sans', category: 'sans-serif' },
  { family: 'Rubik', category: 'sans-serif' },
  { family: 'Oswald', category: 'sans-serif' },
  { family: 'Quicksand', category: 'sans-serif' },
  { family: 'Ubuntu', category: 'sans-serif' },
  { family: 'Mukta', category: 'sans-serif' },
  { family: 'Source Sans Pro', category: 'sans-serif' },
  { family: 'Noto Sans', category: 'sans-serif' },
  { family: 'PT Sans', category: 'sans-serif' },
  { family: 'Karla', category: 'sans-serif' },
  { family: 'Manrope', category: 'sans-serif' },
  { family: 'Barlow', category: 'sans-serif' },
  { family: 'Barlow Condensed', category: 'sans-serif' },
  { family: 'Josefin Sans', category: 'sans-serif' },
  { family: 'Cabin', category: 'sans-serif' },
  { family: 'Arimo', category: 'sans-serif' },
  { family: 'DM Sans', category: 'sans-serif' },
  { family: 'Titillium Web', category: 'sans-serif' },
  { family: 'Hind', category: 'sans-serif' },
  { family: 'Fira Sans', category: 'sans-serif' },
  { family: 'Libre Franklin', category: 'sans-serif' },
  { family: 'Oxygen', category: 'sans-serif' },
  { family: 'Heebo', category: 'sans-serif' },
  { family: 'Exo 2', category: 'sans-serif' },
  { family: 'Asap', category: 'sans-serif' },
  { family: 'Cairo', category: 'sans-serif' },
  { family: 'Overpass', category: 'sans-serif' },
  { family: 'Assistant', category: 'sans-serif' },
  { family: 'Maven Pro', category: 'sans-serif' },
  { family: 'Archivo', category: 'sans-serif' },
  { family: 'Varela Round', category: 'sans-serif' },
  { family: 'Catamaran', category: 'sans-serif' },
  { family: 'ABeeZee', category: 'sans-serif' },
  { family: 'Signika', category: 'sans-serif' },
  { family: 'Questrial', category: 'sans-serif' },
  { family: 'Prompt', category: 'sans-serif' },
  { family: 'Kanit', category: 'sans-serif' },
  { family: 'Mulish', category: 'sans-serif' },
  { family: 'Outfit', category: 'sans-serif' },
  { family: 'Plus Jakarta Sans', category: 'sans-serif' },
  { family: 'Figtree', category: 'sans-serif' },
  
  // Serif fonts
  { family: 'Playfair Display', category: 'serif' },
  { family: 'Merriweather', category: 'serif' },
  { family: 'PT Serif', category: 'serif' },
  { family: 'Libre Baskerville', category: 'serif' },
  { family: 'Crimson Text', category: 'serif' },
  { family: 'Source Serif Pro', category: 'serif' },
  { family: 'Cormorant Garamond', category: 'serif' },
  { family: 'EB Garamond', category: 'serif' },
  { family: 'Spectral', category: 'serif' },
  { family: 'Bitter', category: 'serif' },
  { family: 'Noto Serif', category: 'serif' },
  { family: 'Arvo', category: 'serif' },
  { family: 'Lora', category: 'serif' },
  { family: 'Rokkitt', category: 'serif' },
  { family: 'Cardo', category: 'serif' },
  { family: 'Vollkorn', category: 'serif' },
  { family: 'Literata', category: 'serif' },
  { family: 'Frank Ruhl Libre', category: 'serif' },
  { family: 'Zilla Slab', category: 'serif' },
  { family: 'Domine', category: 'serif' },
  { family: 'Fraunces', category: 'serif' },
  { family: 'Old Standard TT', category: 'serif' },
  { family: 'Libre Caslon Text', category: 'serif' },
  { family: 'Alegreya', category: 'serif' },
  { family: 'Cormorant', category: 'serif' },
  { family: 'Newsreader', category: 'serif' },
  { family: 'IBM Plex Serif', category: 'serif' },
  { family: 'Crimson Pro', category: 'serif' },
  { family: 'Unna', category: 'serif' },
  { family: 'Gelasio', category: 'serif' },
  { family: 'Vidaloka', category: 'serif' },
  { family: 'Sorts Mill Goudy', category: 'serif' },
  { family: 'Amiri', category: 'serif' },
  { family: 'Gilda Display', category: 'serif' },
  { family: 'Arapey', category: 'serif' },
  { family: 'Trirong', category: 'serif' },
  { family: 'Judson', category: 'serif' },
  { family: 'Martel', category: 'serif' },
  { family: 'Neuton', category: 'serif' },
  { family: 'Linden Hill', category: 'serif' },
  
  // Display fonts
  { family: 'Abril Fatface', category: 'display' },
  { family: 'Bebas Neue', category: 'display' },
  { family: 'Righteous', category: 'display' },
  { family: 'Fredoka One', category: 'display' },
  { family: 'Lobster', category: 'display' },
  { family: 'Comfortaa', category: 'display' },
  { family: 'Alfa Slab One', category: 'display' },
  { family: 'Passion One', category: 'display' },
  { family: 'Permanent Marker', category: 'display' },
  { family: 'Russo One', category: 'display' },
  { family: 'Bangers', category: 'display' },
  { family: 'Acme', category: 'display' },
  { family: 'Staatliches', category: 'display' },
  { family: 'Bowlby One SC', category: 'display' },
  { family: 'Bungee', category: 'display' },
  { family: 'Concert One', category: 'display' },
  { family: 'Chewy', category: 'display' },
  { family: 'Courgette', category: 'display' },
  { family: 'Lilita One', category: 'display' },
  { family: 'Carter One', category: 'display' },
  { family: 'Archivo Black', category: 'display' },
  { family: 'Patua One', category: 'display' },
  { family: 'Changa One', category: 'display' },
  { family: 'Fugaz One', category: 'display' },
  { family: 'Fredericka the Great', category: 'display' },
  { family: 'Special Elite', category: 'display' },
  { family: 'Luckiest Guy', category: 'display' },
  { family: 'Black Ops One', category: 'display' },
  { family: 'Ultra', category: 'display' },
  { family: 'Racing Sans One', category: 'display' },
  { family: 'Teko', category: 'display' },
  { family: 'Coda', category: 'display' },
  { family: 'Bree Serif', category: 'display' },
  { family: 'Graduate', category: 'display' },
  { family: 'Monoton', category: 'display' },
  { family: 'Rammetto One', category: 'display' },
  { family: 'Knewave', category: 'display' },
  { family: 'Bungee Inline', category: 'display' },
  { family: 'Shrikhand', category: 'display' },
  { family: 'Titan One', category: 'display' },
  { family: 'Londrina Solid', category: 'display' },
  { family: 'Audiowide', category: 'display' },
  { family: 'Orbitron', category: 'display' },
  { family: 'Press Start 2P', category: 'display' },
  { family: 'Modak', category: 'display' },
  { family: 'Limelight', category: 'display' },
  { family: 'Rubik Mono One', category: 'display' },
  { family: 'Rampart One', category: 'display' },
  { family: 'Dela Gothic One', category: 'display' },
  { family: 'Bungee Shade', category: 'display' },
  
  // Handwriting/Script fonts
  { family: 'Pacifico', category: 'handwriting' },
  { family: 'Dancing Script', category: 'handwriting' },
  { family: 'Great Vibes', category: 'handwriting' },
  { family: 'Satisfy', category: 'handwriting' },
  { family: 'Caveat', category: 'handwriting' },
  { family: 'Kalam', category: 'handwriting' },
  { family: 'Shadows Into Light', category: 'handwriting' },
  { family: 'Indie Flower', category: 'handwriting' },
  { family: 'Sacramento', category: 'handwriting' },
  { family: 'Tangerine', category: 'handwriting' },
  { family: 'Yellowtail', category: 'handwriting' },
  { family: 'Cookie', category: 'handwriting' },
  { family: 'Allura', category: 'handwriting' },
  { family: 'Alex Brush', category: 'handwriting' },
  { family: 'Amatic SC', category: 'handwriting' },
  { family: 'Handlee', category: 'handwriting' },
  { family: 'Architects Daughter', category: 'handwriting' },
  { family: 'Homemade Apple', category: 'handwriting' },
  { family: 'Marck Script', category: 'handwriting' },
  { family: 'Patrick Hand', category: 'handwriting' },
  { family: 'Kaushan Script', category: 'handwriting' },
  { family: 'Lobster Two', category: 'handwriting' },
  { family: 'Pinyon Script', category: 'handwriting' },
  { family: 'Merienda', category: 'handwriting' },
  { family: 'Mr Dafoe', category: 'handwriting' },
  { family: 'Nothing You Could Do', category: 'handwriting' },
  { family: 'Gochi Hand', category: 'handwriting' },
  { family: 'Berkshire Swash', category: 'handwriting' },
  { family: 'Bad Script', category: 'handwriting' },
  { family: 'Covered By Your Grace', category: 'handwriting' },
  { family: 'Just Another Hand', category: 'handwriting' },
  { family: 'Rancho', category: 'handwriting' },
  { family: 'Rock Salt', category: 'handwriting' },
  { family: 'Damion', category: 'handwriting' },
  { family: 'Allison', category: 'handwriting' },
  { family: 'Italianno', category: 'handwriting' },
  { family: 'Rouge Script', category: 'handwriting' },
  { family: 'Euphoria Script', category: 'handwriting' },
  { family: 'Petit Formal Script', category: 'handwriting' },
  { family: 'Carattere', category: 'handwriting' },
  
  // Monospace fonts
  { family: 'Roboto Mono', category: 'monospace' },
  { family: 'Source Code Pro', category: 'monospace' },
  { family: 'Fira Code', category: 'monospace' },
  { family: 'JetBrains Mono', category: 'monospace' },
  { family: 'IBM Plex Mono', category: 'monospace' },
  { family: 'Space Mono', category: 'monospace' },
  { family: 'Inconsolata', category: 'monospace' },
  { family: 'Cousine', category: 'monospace' },
  { family: 'Ubuntu Mono', category: 'monospace' },
  { family: 'PT Mono', category: 'monospace' },
  { family: 'Anonymous Pro', category: 'monospace' },
  { family: 'Overpass Mono', category: 'monospace' },
  { family: 'Nanum Gothic Coding', category: 'monospace' },
  { family: 'DM Mono', category: 'monospace' },
  { family: 'Red Hat Mono', category: 'monospace' },
]

interface FontPickerProps {
  value: string
  onChange: (font: string) => void
  festivalId?: string // For saving uploaded fonts
}

interface CustomFont {
  name: string
  url: string // data URL or blob URL
}

type CategoryFilter = 'all' | 'preset' | 'serif' | 'sans-serif' | 'display' | 'handwriting' | 'monospace' | 'custom'

export default function FontPicker({ value, onChange, festivalId }: FontPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all')
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set())
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([])
  const [uploading, setUploading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Load custom fonts from localStorage on mount (legacy support)
  // and also check if value contains a custom font URL
  useEffect(() => {
    // If the current value is a custom font with URL, load it
    if (value && value.startsWith('custom:') && value.includes('|')) {
      const [, rest] = value.split('custom:')
      const [fontName, fontUrl] = rest.split('|')
      if (fontUrl) {
        // Check if already in customFonts using functional update to avoid stale closure
        setCustomFonts(prev => {
          if (prev.some(f => f.name === fontName)) {
            return prev // Already exists, don't add duplicate
          }
          // Register the font
          const fontFace = new FontFace(fontName, `url(${fontUrl})`)
          fontFace.load().then(loadedFont => {
            document.fonts.add(loadedFont)
          }).catch(err => console.error('Failed to load custom font:', err))
          return [...prev, { name: fontName, url: fontUrl }]
        })
      }
    }
  }, [value])

  // Handle font file upload - uploads to Supabase Storage
  const handleFontUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!festivalId) {
      alert('Festival ID is required for font upload')
      return
    }

    // Validate file type
    const validExtensions = ['.ttf', '.otf', '.woff2', '.woff']
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    
    if (!hasValidExtension) {
      alert('Please upload a valid font file (.ttf, .otf, .woff, or .woff2)')
      return
    }

    setUploading(true)
    
    try {
      // Extract font name from filename
      const fontName = file.name.replace(/\.(ttf|otf|woff2|woff)$/i, '').replace(/[-_]/g, ' ')
      
      // Upload to server
      const formData = new FormData()
      formData.append('font', file)
      formData.append('festivalId', festivalId)
      formData.append('fontName', fontName)
      
      const response = await fetch('/api/admin/festivals/font', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload font')
      }
      
      const result = await response.json()
      
      // Register the font with the browser
      const fontFace = new FontFace(fontName, `url(${result.fontUrl})`)
      const loadedFont = await fontFace.load()
      document.fonts.add(loadedFont)
      
      // Add to custom fonts list
      const newFont: CustomFont = { name: fontName, url: result.fontUrl }
      setCustomFonts(prev => [...prev, newFont])
      
      // Update the value - the API already saved it, but we need to update local state
      onChange(result.headerFont)
      
      setUploading(false)
    } catch (err) {
      console.error('Font upload error:', err)
      alert(err instanceof Error ? err.message : 'Failed to upload font')
      setUploading(false)
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Delete a custom font
  const handleDeleteCustomFont = (fontName: string) => {
    const updatedFonts = customFonts.filter(f => f.name !== fontName)
    setCustomFonts(updatedFonts)
    
    // If this font was selected, reset to default
    // Check both new format (with URL) and legacy format
    if (value.startsWith('custom:') && value.includes(fontName)) {
      onChange('')
    }
  }

  // Load a Google Font dynamically
  const loadFont = useCallback((fontFamily: string) => {
    if (loadedFonts.has(fontFamily) || !fontFamily) return
    
    const link = document.createElement('link')
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@400;700&display=swap`
    link.rel = 'stylesheet'
    document.head.appendChild(link)
    
    setLoadedFonts(prev => new Set(prev).add(fontFamily))
  }, [loadedFonts])

  // Load fonts as they become visible
  const handleFontVisible = useCallback((fontFamily: string) => {
    loadFont(fontFamily)
  }, [loadFont])

  // Filter fonts based on search and category
  const filteredFonts = useCallback(() => {
    const searchLower = search.toLowerCase()
    
    // Get preset fonts
    const presets = PRESET_FONTS.filter(font => {
      if (activeCategory !== 'all' && activeCategory !== 'preset') return false
      return font.name.toLowerCase().includes(searchLower)
    })
    
    // Get custom fonts
    const custom = customFonts.filter(font => {
      if (activeCategory !== 'all' && activeCategory !== 'custom') return false
      return font.name.toLowerCase().includes(searchLower)
    })
    
    // Get Google Fonts
    const google = GOOGLE_FONTS.filter(font => {
      if (activeCategory === 'preset' || activeCategory === 'custom') return false
      if (activeCategory !== 'all' && font.category !== activeCategory) return false
      return font.family.toLowerCase().includes(searchLower)
    })
    
    return { presets, custom, google }
  }, [search, activeCategory, customFonts])

  const { presets, custom, google } = filteredFonts()

  // Get display name for current value
  const getDisplayName = () => {
    if (!value) return 'Default'
    if (value.startsWith('custom:')) {
      // Format: "custom:FontName|url" or legacy "custom:FontName"
      const rest = value.replace('custom:', '')
      if (rest.includes('|')) {
        return rest.split('|')[0]
      }
      return rest
    }
    const preset = PRESET_FONTS.find(f => f.value === value)
    if (preset) return preset.name
    return value
  }

  // Get the font family CSS for the current value
  const getCurrentFontFamily = () => {
    if (!value) return 'inherit'
    if (value.startsWith('custom:')) {
      const rest = value.replace('custom:', '')
      const fontName = rest.includes('|') ? rest.split('|')[0] : rest
      return `"${fontName}", serif`
    }
    if (value.startsWith('var(')) return value
    return `"${value}", serif`
  }

  const handleSelectFont = (fontValue: string) => {
    onChange(fontValue)
    // Don't close dropdown - let users try different fonts
  }

  const categories: { key: CategoryFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'custom', label: `My Fonts${customFonts.length > 0 ? ` (${customFonts.length})` : ''}` },
    { key: 'preset', label: 'Preset' },
    { key: 'serif', label: 'Serif' },
    { key: 'sans-serif', label: 'Sans' },
    { key: 'display', label: 'Display' },
    { key: 'handwriting', label: 'Script' },
    { key: 'monospace', label: 'Mono' },
  ]

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) {
            setTimeout(() => searchInputRef.current?.focus(), 100)
          }
        }}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{ fontFamily: getCurrentFontFamily() }}
      >
        <span className="truncate">{getDisplayName()}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-[400px] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden max-h-[400px] flex flex-col">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-100 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search 200+ fonts..."
                className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1 p-2 border-b border-gray-100 overflow-x-auto flex-shrink-0">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-2 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeCategory === cat.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Font List */}
          <div className="flex-1 overflow-y-auto min-h-0 p-2">
            {/* Custom Fonts Section */}
            {custom.length > 0 && (
              <div className="mb-2">
                {activeCategory === 'all' && (
                  <div className="px-1 py-1 text-xs font-semibold text-gray-500">
                    My Uploaded Fonts
                  </div>
                )}
                <div className="grid grid-cols-2 gap-1">
                  {custom.map((font, index) => {
                    // Check if this font is selected (handle both old and new format)
                    const isSelected = value?.startsWith('custom:') && 
                      (value.includes('|') 
                        ? value.split('|')[0] === `custom:${font.name}`
                        : value === `custom:${font.name}`)
                    return (
                      <FontOption
                        key={`custom-${font.name}-${index}`}
                        fontFamily={font.name}
                        name={font.name}
                        isSelected={isSelected}
                        onClick={() => handleSelectFont(`custom:${font.name}|${font.url}`)}
                        isCustom
                        onDelete={() => handleDeleteCustomFont(font.name)}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {/* Preset Fonts Section */}
            {presets.length > 0 && (
              <div className="mb-2">
                {activeCategory === 'all' && (
                  <div className="px-1 py-1 text-xs font-semibold text-gray-500">
                    App Fonts
                  </div>
                )}
                <div className="grid grid-cols-2 gap-1">
                  {presets.map((font) => (
                    <FontOption
                      key={font.name}
                      fontFamily={font.value || 'inherit'}
                      name={font.name}
                      isSelected={value === font.value}
                      onClick={() => handleSelectFont(font.value)}
                      isPreset
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Google Fonts Section */}
            {google.length > 0 && (
              <div>
                {activeCategory === 'all' && (presets.length > 0 || custom.length > 0) && (
                  <div className="px-1 py-1 text-xs font-semibold text-gray-500">
                    Google Fonts ({GOOGLE_FONTS.length} available)
                  </div>
                )}
                <div className="grid grid-cols-2 gap-1">
                  {google.map((font) => (
                    <FontOption
                      key={font.family}
                      fontFamily={font.family}
                      name={font.family}
                      isSelected={value === font.family}
                      onClick={() => handleSelectFont(font.family)}
                      onVisible={handleFontVisible}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {presets.length === 0 && google.length === 0 && custom.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500">
                <p className="text-sm">No fonts found</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            )}
          </div>

          {/* Custom Font Upload */}
          <div className="p-2 border-t border-gray-100 bg-gray-50 flex-shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept=".ttf,.otf,.woff,.woff2"
              onChange={handleFontUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {uploading ? 'Uploading...' : 'Upload Custom Font'}
            </button>
            <p className="text-xs text-gray-500 text-center mt-1">
              Supports .ttf, .otf, .woff, .woff2
            </p>
          </div>

          {/* Done Button */}
          <div className="p-2 border-t border-gray-200 bg-white flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                setSearch('')
              }}
              className="w-full px-3 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Individual Font Option with lazy loading
interface FontOptionProps {
  fontFamily: string
  name: string
  isSelected: boolean
  onClick: () => void
  isPreset?: boolean
  isCustom?: boolean
  onVisible?: (fontFamily: string) => void
  onDelete?: () => void
}

function FontOption({ fontFamily, name, isSelected, onClick, isPreset, isCustom, onVisible, onDelete }: FontOptionProps) {
  const optionRef = useRef<HTMLDivElement>(null)
  
  // Use Intersection Observer for lazy loading fonts
  useEffect(() => {
    if (isPreset || isCustom || !onVisible) return
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onVisible(fontFamily)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    
    if (optionRef.current) {
      observer.observe(optionRef.current)
    }
    
    return () => observer.disconnect()
  }, [fontFamily, isPreset, isCustom, onVisible])

  return (
    <div
      ref={optionRef}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className={`relative px-2 py-2 text-left rounded-md border transition-colors truncate cursor-pointer ${
        isSelected 
          ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300' 
          : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div 
        className="text-sm truncate pr-4"
        style={{ fontFamily: isPreset ? fontFamily : `"${fontFamily}", sans-serif` }}
      >
        {name}
      </div>
      {isSelected && (
        <Check className="absolute top-1 right-1 w-3 h-3 text-blue-500" />
      )}
      {isCustom && onDelete && !isSelected && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-red-500 rounded"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}
