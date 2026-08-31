import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getCurrentCoordinates, encodeLocation } from '../lib/location'

const LocationContext = createContext(null)
const LOCATION_STORAGE_KEY = 'benne-saaram.location.v1'

function readStoredLocation() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(LOCATION_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
      const encoded = encodeLocation(parsed.latitude, parsed.longitude)
      return {
        ...encoded,
        accuracy: parsed.accuracy || null,
        timestamp: parsed.timestamp || Date.now(),
      }
    }
    return null
  } catch {
    return null
  }
}

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(readStoredLocation)
  const [status, setStatus] = useState('idle') // 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable' | 'unsupported'
  const [error, setError] = useState(null)

  const requestLocation = useCallback(async (options = {}) => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setStatus('unsupported')
      setError('Geolocation is not supported by your browser')
      return null
    }

    setStatus('requesting')
    setError(null)

    try {
      const coords = await getCurrentCoordinates(options)
      setLocation(coords)
      setStatus('granted')
      setError(null)
      try {
        localStorage.setItem(
          LOCATION_STORAGE_KEY,
          JSON.stringify({
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy,
            timestamp: coords.timestamp,
          })
        )
      } catch {
        // Storage unavailable
      }
      return coords
    } catch (err) {
      console.warn('Geolocation request failed or denied:', err)
      if (err.code === 1) {
        // PERMISSION_DENIED
        setStatus('denied')
        setError('Location permission denied')
      } else if (err.code === 2) {
        // POSITION_UNAVAILABLE
        setStatus('unavailable')
        setError('Location position unavailable')
      } else if (err.code === 3) {
        // TIMEOUT
        setStatus('unavailable')
        setError('Location request timed out')
      } else {
        setStatus('unavailable')
        setError(err.message || 'Unable to retrieve location')
      }
      return null
    }
  }, [])

  // Request location automatically upon visit
  useEffect(() => {
    // Check permission status if API is available
    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then(permissionStatus => {
          if (permissionStatus.state === 'granted') {
            setStatus('granted')
          } else if (permissionStatus.state === 'denied') {
            setStatus('denied')
          } else {
            setStatus('prompt')
          }

          permissionStatus.onchange = () => {
            if (permissionStatus.state === 'granted') {
              requestLocation()
            } else if (permissionStatus.state === 'denied') {
              setStatus('denied')
            }
          }
        })
        .catch(() => {
          // Permissions API might not support geolocation in some environments
        })
    }

    // Trigger permission prompt upon visit
    requestLocation()
  }, [requestLocation])

  return (
    <LocationContext.Provider
      value={{
        location,
        status,
        error,
        requestLocation,
        hasLocation: Boolean(location && location.sevenCharCode),
      }}
    >
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  const ctx = useContext(LocationContext)
  if (!ctx) throw new Error('useLocation must be used within LocationProvider')
  return ctx
}
