export interface Location {
  lat: number
  lng: number
}

export interface ETAResult {
  distanceKm: number
  distanceMeters: number
  etaMinutes: number
  etaSeconds: number
  formattedDistance: string
  formattedETA: string
}

// Haversine formula for accurate distance calculation
export function calculateDistance(from: Location, to: Location): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(to.lat - from.lat)
  const dLng = toRadians(to.lng - from.lng)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return distance
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// Calculate ETA based on distance and average ambulance speed
export function calculateETA(from: Location, to: Location, avgSpeedKmh = 40): ETAResult {
  const distanceKm = calculateDistance(from, to)
  const distanceMeters = distanceKm * 1000

  // Calculate time in hours, then convert to minutes
  const timeHours = distanceKm / avgSpeedKmh
  const etaMinutes = Math.ceil(timeHours * 60)
  const etaSeconds = Math.ceil(timeHours * 3600)

  // Format distance
  const formattedDistance = distanceKm < 1 ? `${Math.round(distanceMeters)} m` : `${distanceKm.toFixed(2)} km`

  // Format ETA
  const formattedETA = etaMinutes < 60 ? `${etaMinutes} min` : `${Math.floor(etaMinutes / 60)}h ${etaMinutes % 60}m`

  return {
    distanceKm,
    distanceMeters,
    etaMinutes,
    etaSeconds,
    formattedDistance,
    formattedETA,
  }
}

// Check if ambulance has reached destination (within 50 meters)
export function hasReachedDestination(from: Location, to: Location): boolean {
  const distanceMeters = calculateDistance(from, to) * 1000
  return distanceMeters <= 50
}
