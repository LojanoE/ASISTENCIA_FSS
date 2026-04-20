export class GeolocationError extends Error {
  code: number
  constructor(message: string, code: number) {
    super(message)
    this.name = 'GeolocationError'
    this.code = code
  }
}

export async function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new GeolocationError('Geolocalización no disponible', 0))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, (err) => {
      reject(new GeolocationError(err.message, err.code))
    }, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    })
  })
}

export function isWithinGeofence(
  lat: number,
  lng: number,
  fence: { latitude: number; longitude: number; radiusMeters: number }
): boolean {
  const R = 6371000
  const dLat = toRad(fence.latitude - lat)
  const dLng = toRad(fence.longitude - lng)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat)) * Math.cos(toRad(fence.latitude)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return distance <= fence.radiusMeters
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}