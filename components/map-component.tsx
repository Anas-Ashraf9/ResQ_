"use client"

import { useEffect, useRef } from "react"

interface MapComponentProps {
  latitude: number
  longitude: number
  userLatitude?: number
  userLongitude?: number
  markerColor?: "red" | "blue" | "green"
  zoom?: number
  className?: string
}

export default function MapComponent({
  latitude,
  longitude,
  userLatitude,
  userLongitude,
  markerColor = "red",
  zoom = 15,
  className = "",
}: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const ambulanceMarkerRef = useRef<any>(null)
  const userMarkerRef = useRef<any>(null)
  const leafletRef = useRef<any>(null)
  const routeLayerRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    const initMap = async () => {
      const L = (await import("leaflet")).default
      leafletRef.current = L

      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css"
      document.head.appendChild(link)

      if (mapContainer.current && !mapRef.current) {
        mapRef.current = L.map(mapContainer.current).setView([latitude, longitude], zoom)

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(mapRef.current)

        ambulanceMarkerRef.current = L.marker([latitude, longitude], {
          icon: L.divIcon({
            html: `<div style="font-size: 32px; text-align: center; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">🚑</div>`,
            iconSize: [40, 40],
            className: "custom-marker",
          }),
        }).addTo(mapRef.current)

        ambulanceMarkerRef.current.bindPopup(
          `<strong>Ambulance</strong><br/>Lat: ${latitude.toFixed(4)}<br/>Lng: ${longitude.toFixed(4)}`,
        )

        if (userLatitude && userLongitude) {
          userMarkerRef.current = L.marker([userLatitude, userLongitude], {
            icon: L.divIcon({
              html: `<div style="font-size: 28px; text-align: center; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">📍</div>`,
              iconSize: [36, 36],
              className: "custom-marker",
            }),
          }).addTo(mapRef.current)

          userMarkerRef.current.bindPopup(
            `<strong>Your Location</strong><br/>Lat: ${userLatitude.toFixed(4)}<br/>Lng: ${userLongitude.toFixed(4)}`,
          )

          fetchOSRMRoute(longitude, latitude, userLongitude, userLatitude, L)
        }
      }
    }

    initMap()
  }, [])

  const fetchOSRMRoute = async (lon1: number, lat1: number, lon2: number, lat2: number, L: any) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`
      const response = await fetch(url)
      const data = await response.json()

      if (data.routes && data.routes[0]) {
        const coordinates = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]])

        if (routeLayerRef.current && mapRef.current) {
          mapRef.current.removeLayer(routeLayerRef.current)
        }

        routeLayerRef.current = L.polyline(coordinates, {
          color: "blue",
          weight: 4,
          opacity: 0.7,
        }).addTo(mapRef.current)

        console.log("[v0] OSRM route loaded successfully")
      }
    } catch (error) {
      console.error("[v0] OSRM route fetch failed:", error)
      if (mapRef.current && userLatitude && userLongitude) {
        routeLayerRef.current = L.polyline(
          [
            [latitude, longitude],
            [userLatitude, userLongitude],
          ],
          { color: "red", weight: 2, opacity: 0.6, dashArray: "5, 5" },
        ).addTo(mapRef.current)
      }
    }
  }

  useEffect(() => {
    if (!mapRef.current || !leafletRef.current) return
    const L = leafletRef.current

    if (ambulanceMarkerRef.current) {
      ambulanceMarkerRef.current.setLatLng([latitude, longitude])

      if (userLatitude && userLongitude) {
        fetchOSRMRoute(longitude, latitude, userLongitude, userLatitude, L)
      }
    }

    if (mapRef.current) {
      mapRef.current.setView([latitude, longitude], zoom)
    }
  }, [latitude, longitude, userLatitude, userLongitude, zoom])

  return <div ref={mapContainer} className={`w-full h-full rounded-lg ${className}`} />
}
