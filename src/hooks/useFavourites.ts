/**
 * useFavourites Hook
 * 
 * Manages session favourites with optimistic updates and persistence.
 * Uses anonymous user IDs - no login required.
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getAnonUserId } from '@/lib/utils/anonUser'

interface FavouriteSession {
  id: string
  sessionId: string
  festivalId: string
  createdAt: string
}

interface UseFavouritesOptions {
  festivalId?: string
}

interface UseFavouritesReturn {
  favourites: Set<string>  // Set of session IDs
  isLoading: boolean
  error: string | null
  isFavourite: (sessionId: string) => boolean
  toggleFavourite: (sessionId: string, festivalId: string) => Promise<void>
  addFavourite: (sessionId: string, festivalId: string) => Promise<void>
  removeFavourite: (sessionId: string) => Promise<void>
  favouritesList: FavouriteSession[]
}

export function useFavourites(options: UseFavouritesOptions = {}): UseFavouritesReturn {
  const [favourites, setFavourites] = useState<Set<string>>(new Set())
  const [favouritesList, setFavouritesList] = useState<FavouriteSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const anonUserIdRef = useRef<string>('')

  // Load favourites on mount
  useEffect(() => {
    const loadFavourites = async () => {
      try {
        const anonUserId = getAnonUserId()
        if (!anonUserId) {
          setIsLoading(false)
          return
        }
        
        anonUserIdRef.current = anonUserId

        const params = new URLSearchParams({ anonUserId })
        if (options.festivalId) {
          params.append('festivalId', options.festivalId)
        }

        const response = await fetch(`/api/favourites/my?${params}`)
        
        if (response.ok) {
          const data = await response.json()
          const sessionIds = new Set<string>(data.favourites.map((f: FavouriteSession) => f.sessionId))
          setFavourites(sessionIds)
          setFavouritesList(data.favourites)
        } else {
          console.error('Failed to load favourites')
        }
      } catch (err) {
        console.error('Error loading favourites:', err)
        setError('Failed to load favourites')
      } finally {
        setIsLoading(false)
      }
    }

    loadFavourites()
  }, [options.festivalId])

  const isFavourite = useCallback((sessionId: string): boolean => {
    return favourites.has(sessionId)
  }, [favourites])

  const addFavourite = useCallback(async (sessionId: string, festivalId: string): Promise<void> => {
    const anonUserId = anonUserIdRef.current || getAnonUserId()
    if (!anonUserId) {
      setError('Unable to save favourite')
      return
    }

    // Optimistic update
    setFavourites(prev => new Set([...prev, sessionId]))

    try {
      const response = await fetch('/api/favourites/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anonUserId,
          sessionId,
          festivalId
        })
      })

      if (!response.ok) {
        // Rollback on failure
        setFavourites(prev => {
          const next = new Set(prev)
          next.delete(sessionId)
          return next
        })
        setError('Failed to save favourite')
      } else {
        const data = await response.json()
        // Update the full list
        setFavouritesList(prev => [...prev, data.favourite])
      }
    } catch (err) {
      // Rollback on error
      setFavourites(prev => {
        const next = new Set(prev)
        next.delete(sessionId)
        return next
      })
      setError('Failed to save favourite')
    }
  }, [])

  const removeFavourite = useCallback(async (sessionId: string): Promise<void> => {
    const anonUserId = anonUserIdRef.current || getAnonUserId()
    if (!anonUserId) return

    // Store for potential rollback
    const wasInList = favourites.has(sessionId)
    const removedItem = favouritesList.find(f => f.sessionId === sessionId)

    // Optimistic update
    setFavourites(prev => {
      const next = new Set(prev)
      next.delete(sessionId)
      return next
    })
    setFavouritesList(prev => prev.filter(f => f.sessionId !== sessionId))

    try {
      const response = await fetch('/api/favourites/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anonUserId,
          sessionId
        })
      })

      if (!response.ok) {
        // Rollback on failure
        if (wasInList) {
          setFavourites(prev => new Set([...prev, sessionId]))
        }
        if (removedItem) {
          setFavouritesList(prev => [...prev, removedItem])
        }
        setError('Failed to remove favourite')
      }
    } catch (err) {
      // Rollback on error
      if (wasInList) {
        setFavourites(prev => new Set([...prev, sessionId]))
      }
      if (removedItem) {
        setFavouritesList(prev => [...prev, removedItem])
      }
      setError('Failed to remove favourite')
    }
  }, [favourites, favouritesList])

  const toggleFavourite = useCallback(async (sessionId: string, festivalId: string): Promise<void> => {
    if (isFavourite(sessionId)) {
      await removeFavourite(sessionId)
    } else {
      await addFavourite(sessionId, festivalId)
    }
  }, [isFavourite, addFavourite, removeFavourite])

  return {
    favourites,
    isLoading,
    error,
    isFavourite,
    toggleFavourite,
    addFavourite,
    removeFavourite,
    favouritesList
  }
}
