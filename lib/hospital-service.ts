// Service to fetch nearby hospitals based on device location

export interface NearbyHospital {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  distance: number // in km
  phone?: string
  totalBeds: number
  availableBeds: number
  icuBeds: number
  availableIcuBeds: number
  emergencyContact: string
  isCustom?: boolean
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Generate random bed availability for demo purposes
function generateBedAvailability() {
  const totalBeds = Math.floor(Math.random() * 400) + 100
  const availableBeds = Math.floor(Math.random() * (totalBeds * 0.3))
  const icuBeds = Math.floor(totalBeds * 0.1)
  const availableIcuBeds = Math.floor(Math.random() * (icuBeds * 0.4))
  return { totalBeds, availableBeds, icuBeds, availableIcuBeds }
}

function getFallbackHospitals(lat: number, lng: number): NearbyHospital[] {
  const fallbackHospitals = [
    { name: "AIIMS Hospital", lat: 28.5672, lng: 77.21, city: "Delhi" },
    { name: "Apollo Hospital", lat: 28.5355, lng: 77.25, city: "Delhi" },
    { name: "Max Super Speciality Hospital", lat: 28.528, lng: 77.219, city: "Delhi" },
    { name: "Fortis Hospital", lat: 28.4595, lng: 77.0266, city: "Gurgaon" },
    { name: "Sir Ganga Ram Hospital", lat: 28.6392, lng: 77.1897, city: "Delhi" },
    { name: "Safdarjung Hospital", lat: 28.5682, lng: 77.2067, city: "Delhi" },
    { name: "BLK Super Speciality Hospital", lat: 28.6489, lng: 77.1866, city: "Delhi" },
    { name: "Medanta - The Medicity", lat: 28.4089, lng: 77.041, city: "Gurgaon" },
    { name: "Indraprastha Apollo Hospital", lat: 28.5407, lng: 77.2834, city: "Delhi" },
    { name: "Ram Manohar Lohia Hospital", lat: 28.6257, lng: 77.2042, city: "Delhi" },
    { name: "Lilavati Hospital", lat: 19.0509, lng: 72.8294, city: "Mumbai" },
    { name: "Kokilaben Hospital", lat: 19.1308, lng: 72.8264, city: "Mumbai" },
    { name: "CMC Vellore", lat: 12.9249, lng: 79.1326, city: "Vellore" },
    { name: "NIMHANS", lat: 12.9432, lng: 77.5966, city: "Bangalore" },
  ]

  return fallbackHospitals
    .map((h, index) => {
      const distance = calculateDistance(lat, lng, h.lat, h.lng)
      const beds = generateBedAvailability()
      return {
        id: `FALLBACK_${index}`,
        name: h.name,
        address: `${h.city} - ${distance.toFixed(1)} km from your location`,
        lat: h.lat,
        lng: h.lng,
        distance,
        ...beds,
        emergencyContact: "+91 100",
      }
    })
    .sort((a, b) => a.distance - b.distance)
}

export async function fetchNearbyHospitals(lat: number, lng: number, radiusKm = 10): Promise<NearbyHospital[]> {
  try {
    // Try using Nominatim API which is more reliable
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=hospital&limit=20&bounded=1&viewbox=${lng - 0.1},${lat + 0.1},${lng + 0.1},${lat - 0.1}`,
      {
        headers: {
          "User-Agent": "AmbulanceApp/1.0",
        },
      },
    )

    if (!response.ok) {
      // Return fallback hospitals directly instead of throwing
      return getFallbackHospitals(lat, lng)
    }

    const data = await response.json()

    if (!data || data.length === 0) {
      return getFallbackHospitals(lat, lng)
    }

    const hospitals: NearbyHospital[] = data
      .filter((el: any) => el.display_name)
      .map((el: any, index: number) => {
        const hospLat = Number.parseFloat(el.lat)
        const hospLng = Number.parseFloat(el.lon)
        const distance = calculateDistance(lat, lng, hospLat, hospLng)
        const beds = generateBedAvailability()

        // Extract hospital name from display_name
        const nameParts = el.display_name.split(",")
        const name = nameParts[0].trim()

        return {
          id: `OSM_${el.place_id}`,
          name: name,
          address: nameParts.slice(1, 3).join(",").trim() || `${distance.toFixed(1)} km away`,
          lat: hospLat,
          lng: hospLng,
          distance,
          ...beds,
          emergencyContact: "+91 100",
        }
      })
      .filter((h: NearbyHospital) => h.distance <= radiusKm)
      .sort((a: NearbyHospital, b: NearbyHospital) => a.distance - b.distance)
      .slice(0, 15)

    // If no hospitals found from API, use fallback
    if (hospitals.length === 0) {
      return getFallbackHospitals(lat, lng)
    }

    return hospitals
  } catch (error) {
    // Silently return fallback hospitals on any error
    return getFallbackHospitals(lat, lng)
  }
}

// Save custom hospital data to localStorage
export function saveCustomHospitals(hospitals: NearbyHospital[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("customHospitals", JSON.stringify(hospitals))
  }
}

// Get custom hospital data from localStorage
export function getCustomHospitals(): NearbyHospital[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem("customHospitals")
  return data ? JSON.parse(data) : []
}

// Update a single hospital
export function updateHospital(hospital: NearbyHospital): void {
  const hospitals = getCustomHospitals()
  const index = hospitals.findIndex((h) => h.id === hospital.id)
  if (index >= 0) {
    hospitals[index] = hospital
  } else {
    hospitals.push({ ...hospital, isCustom: true })
  }
  saveCustomHospitals(hospitals)
}
