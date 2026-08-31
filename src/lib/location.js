import { OpenLocationCode } from 'open-location-code'

const olc = new OpenLocationCode()

// Nashik center coordinates for reference
export const NASHIK_REFERENCE = {
  latitude: 19.9975,
  longitude: 73.7898,
}

/**
 * Encodes latitude and longitude into Google Plus Code formats:
 * - fullCode (e.g. "7JGM2Q35+82X")
 * - shortCode / 7-letter tag (e.g. "2Q35+82X")
 * - mapsUrl (direct Google Maps pin)
 */
export function encodeLocation(latitude, longitude) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return null
  }

  try {
    // 11-character precision gives the 7-letter local tag + '+' (e.g. 2Q35+82X)
    const fullCode11 = olc.encode(latitude, longitude, 11)
    const fullCode10 = olc.encode(latitude, longitude, 10)

    // Local 7-letter tag is the code with the 4-char area prefix stripped (e.g. 2Q35+82X)
    const sevenCharCode = fullCode11.length >= 12 ? fullCode11.slice(4) : fullCode11
    const sixCharCode = fullCode10.length >= 11 ? fullCode10.slice(4) : fullCode10

    // Shortened code relative to Nashik
    let relativeShortCode = sevenCharCode
    try {
      relativeShortCode = olc.shorten(fullCode11, NASHIK_REFERENCE.latitude, NASHIK_REFERENCE.longitude)
    } catch {
      relativeShortCode = sevenCharCode
    }

    const latFixed = latitude.toFixed(6)
    const lngFixed = longitude.toFixed(6)

    return {
      latitude,
      longitude,
      fullCode: fullCode11,
      fullCode10,
      sevenCharCode,
      sixCharCode,
      shortCode: sevenCharCode || relativeShortCode,
      mapsUrl: `https://maps.google.com/?q=${latFixed},${lngFixed}`,
      plusCodesUrl: `https://plus.codes/${fullCode11}`,
    }
  } catch (err) {
    console.error('Failed to encode location into Plus Code:', err)
    const latFixed = latitude.toFixed(6)
    const lngFixed = longitude.toFixed(6)
    return {
      latitude,
      longitude,
      fullCode: '',
      sevenCharCode: '',
      shortCode: '',
      mapsUrl: `https://maps.google.com/?q=${latFixed},${lngFixed}`,
      plusCodesUrl: `https://maps.google.com/?q=${latFixed},${lngFixed}`,
    }
  }
}

/**
 * Requests the user's current GPS position using the browser's Geolocation API.
 */
export function getCurrentCoordinates(options = {}) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported by your browser'))
      return
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
      ...options,
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude, accuracy } = position.coords
        const encoded = encodeLocation(latitude, longitude)
        resolve({
          ...encoded,
          accuracy,
          timestamp: position.timestamp,
        })
      },
      error => {
        reject(error)
      },
      defaultOptions
    )
  })
}
