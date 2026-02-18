"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"
import dynamic from "next/dynamic"
const MapComponent = dynamic(() => import("@/components/map-component"), { ssr: false })
import Link from "next/link"
import { AMBULANCE_TYPES } from "@/lib/ambulance-types"
import { RealtimeService } from "@/lib/realtime-service"

export default function TrackingPage() {
  const [order, setOrder] = useState<any>(null)
  const [userLocation, setUserLocation] = useState({ lat: 28.6139, lng: 77.209 })
  const [ambulancePosition, setAmbulancePosition] = useState({ lat: 28.6139, lng: 77.209 })
  const [driverName] = useState("Rajesh Kumar")
  const [eta, setEta] = useState("8 mins")
  const [status, setStatus] = useState("arriving")
  const [distance, setDistance] = useState("2.5 km")

  useEffect(() => {
    const currentOrder = localStorage.getItem("currentOrder")
    if (currentOrder) {
      const orderData = JSON.parse(currentOrder)
      setOrder(orderData)
      const targetLocation = {
        lat: orderData.location.lat,
        lng: orderData.location.lng,
      }
      setUserLocation(targetLocation)
      // Start ambulance from a random location away from user
      setAmbulancePosition({
        lat: targetLocation.lat + (Math.random() - 0.5) * 0.02,
        lng: targetLocation.lng + (Math.random() - 0.5) * 0.02,
      })

      let etaSeconds = 240 // 4 minutes in seconds (increased speed = faster arrival)
      const interval = setInterval(() => {
        setAmbulancePosition((prev) => {
          const deltaLat = (targetLocation.lat - prev.lat) * 0.15
          const deltaLng = (targetLocation.lng - prev.lng) * 0.15

          const newLat = prev.lat + deltaLat
          const newLng = prev.lng + deltaLng

          // Calculate distance in kilometers
          const R = 6371 // Earth's radius in km
          const dLat = (targetLocation.lat - newLat) * (Math.PI / 180)
          const dLng = (targetLocation.lng - newLng) * (Math.PI / 180)
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(newLat * (Math.PI / 180)) *
              Math.cos(targetLocation.lat * (Math.PI / 180)) *
              Math.sin(dLng / 2) *
              Math.sin(dLng / 2)
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
          const calculatedDistance = (R * c).toFixed(2)

          setDistance(`${calculatedDistance} km`)
          return { lat: newLat, lng: newLng }
        })

        etaSeconds -= 3
        if (etaSeconds > 60) {
          const mins = Math.ceil(etaSeconds / 60)
          setEta(`${mins} min${mins > 1 ? "s" : ""}`)
        } else if (etaSeconds > 0) {
          setEta(`${etaSeconds} secs`)
        } else {
          setEta("Arrived")
          setStatus("arrived")
        }
      }, 2000)

      const realtimeService = RealtimeService.getInstance()
      const unsubscribe = realtimeService.subscribe("orders", () => {
        const updatedOrder = localStorage.getItem("currentOrder")
        if (updatedOrder) {
          const orderData = JSON.parse(updatedOrder)
          setOrder(orderData)
          setStatus(orderData.status || status)
        }
      })

      return () => {
        clearInterval(interval)
        unsubscribe()
      }
    }
  }, [])

  const getStatusColor = (s: string) => {
    if (s === "arriving") return "bg-primary/10 text-primary border-primary/30"
    if (s === "arrived") return "bg-secondary/10 text-secondary border-secondary/30"
    return "bg-muted text-muted-foreground border-border"
  }

  const ambulanceTypeInfo = AMBULANCE_TYPES.find((t) => t.id === order?.ambulanceType)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Track Your Ambulance</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-0 overflow-hidden border-2 h-96 shadow-lg">
              <MapComponent
                latitude={ambulancePosition.lat}
                longitude={ambulancePosition.lng}
                userLatitude={userLocation.lat}
                userLongitude={userLocation.lng}
                markerColor="red"
                zoom={16}
              />
            </Card>

            <Card className="mt-6 p-6 border-2">
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-4 border-b border-border">
                  <span className="text-sm text-muted-foreground">Ambulance Position</span>
                  <span className="text-xs font-mono text-foreground">
                    {ambulancePosition.lat.toFixed(4)}, {ambulancePosition.lng.toFixed(4)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold">Estimated Arrival</p>
                    <p className="text-lg font-bold text-primary">{eta}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold">Distance</p>
                    <p className="text-lg font-bold text-secondary">{distance}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            {/* Status */}
            <Card className={`p-6 border-2 ${getStatusColor(status)}`}>
              <h3 className="font-semibold mb-2 text-sm">STATUS</h3>
              <p className="text-2xl font-bold capitalize">{status}</p>
            </Card>

            {/* Driver Info */}
            <Card className="p-6 border-2">
              <h3 className="font-semibold text-foreground mb-4 text-sm">DRIVER INFORMATION</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-2xl">
                  👨‍⚕️
                </div>
                <div>
                  <p className="font-semibold text-foreground">{driverName}</p>
                  <p className="text-xs text-muted-foreground">Professional Paramedic</p>
                </div>
              </div>
              <div className="text-sm border-t border-border pt-3">
                <p className="text-muted-foreground">⭐ 4.9/5.0 (245+ rides)</p>
                <p className="text-xs text-muted-foreground mt-1">License: MED-2024-0547</p>
              </div>
            </Card>

            {/* Order Summary */}
            {order && ambulanceTypeInfo && (
              <Card className="p-6 border-2">
                <h3 className="font-semibold text-foreground mb-4 text-sm">ORDER DETAILS</h3>
                <div className="space-y-3 text-sm">
                  <div className="pb-3 border-b border-border">
                    <p className="text-xs text-muted-foreground font-semibold">ORDER ID</p>
                    <p className="font-mono text-xs text-foreground mt-1">{order.id}</p>
                  </div>
                  <div className="pb-3 border-b border-border">
                    <p className="text-xs text-muted-foreground font-semibold">AMBULANCE TYPE</p>
                    <p className="text-foreground mt-1 font-semibold">{ambulanceTypeInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">EMERGENCY</p>
                    <p className="text-foreground mt-1 capitalize">{order.patientInfo.emergencyType}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Call Button */}
            <Button className="w-full bg-primary hover:bg-primary/90 h-12 font-semibold">📞 Call Driver</Button>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/book" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full bg-transparent">
              Book Another Ambulance
            </Button>
          </Link>
          <Link href="/dashboard" className="flex-1 sm:flex-none">
            <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
