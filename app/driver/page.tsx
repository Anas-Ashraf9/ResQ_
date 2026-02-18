"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/header"
import dynamic from "next/dynamic"
const MapComponent = dynamic(() => import("@/components/map-component"), { ssr: false })
import { AMBULANCE_TYPES } from "@/lib/ambulance-types"
import { getOrders, updateOrderStatus, DRIVERS, type Order, type Driver } from "@/lib/order-store"
import { RealtimeService } from "@/lib/realtime-service"

export default function DriverPanel() {
  const [driver, setDriver] = useState<Driver | null>(null)
  const [pendingOrders, setPendingOrders] = useState<Order[]>([])
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [driverLocation, setDriverLocation] = useState({ lat: 28.6139, lng: 77.209 })
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Simulate logged-in driver (first driver from list)
    const loggedDriver = DRIVERS[0]
    setDriver(loggedDriver)
    setDriverLocation(loggedDriver.location)

    // Load orders
    loadOrders()

    // Poll for new orders every 3 seconds
    const interval = setInterval(loadOrders, 3000)

    const realtimeService = RealtimeService.getInstance()
    const unsubscribe = realtimeService.subscribe("orders", loadOrders)

    return () => {
      clearInterval(interval)
      unsubscribe()
    }
  }, [])

  const loadOrders = () => {
    const allOrders = getOrders()
    const pending = allOrders.filter((o) => o.status === "pending")
    const active = allOrders.find(
      (o) => o.driverId === DRIVERS[0].id && ["accepted", "arriving", "arrived", "in_transit"].includes(o.status),
    )
    setPendingOrders(pending)
    if (active) setCurrentOrder(active)
  }

  const acceptOrder = (order: Order) => {
    if (!driver) return

    const updatedOrder = updateOrderStatus(order.id, "accepted", {
      driverId: driver.id,
      driverName: driver.name,
      driverPhone: driver.phone,
      acceptedAt: new Date().toISOString(),
    })

    if (updatedOrder) {
      setCurrentOrder(updatedOrder)
      setPendingOrders((prev) => prev.filter((o) => o.id !== order.id))
      RealtimeService.getInstance().triggerUpdate("orders")
    }
  }

  const updateStatus = (newStatus: Order["status"]) => {
    if (!currentOrder) return

    const additionalData: Partial<Order> = {}
    if (newStatus === "arrived") {
      additionalData.arrivedAt = new Date().toISOString()
    } else if (newStatus === "completed") {
      additionalData.completedAt = new Date().toISOString()
    }

    const updatedOrder = updateOrderStatus(currentOrder.id, newStatus, additionalData)

    if (newStatus === "completed" || newStatus === "cancelled") {
      setCurrentOrder(null)
    } else if (updatedOrder) {
      setCurrentOrder(updatedOrder)
    }

    RealtimeService.getInstance().triggerUpdate("orders")
  }

  const getAmbulanceInfo = (typeId: string) => {
    return AMBULANCE_TYPES.find((t) => t.id === typeId)
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
      accepted: "bg-blue-500/20 text-blue-600 border-blue-500/30",
      arriving: "bg-primary/20 text-primary border-primary/30",
      arrived: "bg-green-500/20 text-green-600 border-green-500/30",
      in_transit: "bg-purple-500/20 text-purple-600 border-purple-500/30",
      completed: "bg-secondary/20 text-secondary border-secondary/30",
    }
    return colors[status] || "bg-muted text-muted-foreground"
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Driver Info Bar */}
        <Card className="p-4 mb-6 border-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-2xl">
                👨‍⚕️
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{driver?.name || "Loading..."}</h2>
                <p className="text-sm text-muted-foreground">
                  {driver?.vehicleNumber} | {getAmbulanceInfo(driver?.ambulanceType || "")?.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">Rating: {driver?.rating}/5</span>
                  <span className="text-xs text-muted-foreground">|</span>
                  <span className="text-xs text-muted-foreground">{driver?.totalRides} rides</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant={isOnline ? "default" : "outline"}
                onClick={() => setIsOnline(!isOnline)}
                className={isOnline ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {isOnline ? "Online" : "Offline"}
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <Card className="p-0 overflow-hidden border-2 h-[500px]">
              <MapComponent
                latitude={currentOrder?.location.lat || driverLocation.lat}
                longitude={currentOrder?.location.lng || driverLocation.lng}
                userLatitude={driverLocation.lat}
                userLongitude={driverLocation.lng}
                markerColor="red"
                zoom={14}
              />
            </Card>
          </div>

          {/* Orders Section */}
          <div className="space-y-4">
            {/* Current Order */}
            {currentOrder ? (
              <Card className="p-5 border-2 border-primary/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground">CURRENT ORDER</h3>
                  <Badge className={getStatusBadge(currentOrder.status)}>
                    {currentOrder.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>

                <div className="space-y-4">
                  {/* Patient Info */}
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground font-semibold mb-1">PATIENT</p>
                    <p className="font-semibold text-foreground">{currentOrder.patientInfo.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Age: {currentOrder.patientInfo.age} | {currentOrder.patientInfo.emergencyType}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{currentOrder.patientInfo.phone}</p>
                  </div>

                  {/* Location */}
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground font-semibold mb-1">PICKUP LOCATION</p>
                    <p className="text-sm text-foreground">{currentOrder.location.address}</p>
                    <p className="text-xs font-mono text-muted-foreground mt-1">
                      {currentOrder.location.lat.toFixed(4)}, {currentOrder.location.lng.toFixed(4)}
                    </p>
                  </div>

                  {/* Ambulance Type */}
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground font-semibold mb-1">AMBULANCE TYPE</p>
                    <p className="font-semibold text-foreground">
                      {getAmbulanceInfo(currentOrder.ambulanceType)?.name}
                    </p>
                  </div>

                  {/* Customer Contact */}
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground font-semibold mb-1">CUSTOMER CONTACT</p>
                    <p className="font-semibold text-foreground">
                      {currentOrder.patientInfo.name || currentOrder.customerName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {currentOrder.customerPhone || currentOrder.patientInfo.phone}
                    </p>
                    {currentOrder.patientInfo.emergencyContactName && (
                      <div className="mt-2 pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground">Emergency Contact</p>
                        <p className="text-sm font-medium text-foreground">
                          {currentOrder.patientInfo.emergencyContactName}
                        </p>
                        <p className="text-xs text-muted-foreground">{currentOrder.patientInfo.emergencyContact}</p>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {currentOrder.patientInfo.notes && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <p className="text-xs text-yellow-600 font-semibold mb-1">NOTES</p>
                      <p className="text-sm text-foreground">{currentOrder.patientInfo.notes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    {currentOrder.status === "accepted" && (
                      <Button
                        onClick={() => updateStatus("arriving")}
                        className="w-full bg-primary hover:bg-primary/90"
                      >
                        Start Journey
                      </Button>
                    )}
                    {currentOrder.status === "arriving" && (
                      <Button
                        onClick={() => updateStatus("arrived")}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        Mark as Arrived
                      </Button>
                    )}
                    {currentOrder.status === "arrived" && (
                      <Button
                        onClick={() => updateStatus("in_transit")}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        Start Hospital Transit
                      </Button>
                    )}
                    {currentOrder.status === "in_transit" && (
                      <Button
                        onClick={() => updateStatus("completed")}
                        className="w-full bg-secondary hover:bg-secondary/90"
                      >
                        Complete Ride
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => window.open(`tel:${currentOrder.customerPhone}`)}
                    >
                      Call Customer
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <>
                {/* Pending Orders */}
                <div>
                  <h3 className="font-bold text-foreground mb-3">INCOMING ORDERS ({pendingOrders.length})</h3>

                  {!isOnline ? (
                    <Card className="p-6 border-2 text-center">
                      <p className="text-muted-foreground">You are offline. Go online to receive orders.</p>
                    </Card>
                  ) : pendingOrders.length === 0 ? (
                    <Card className="p-6 border-2 text-center">
                      <div className="text-4xl mb-3">🚑</div>
                      <p className="text-muted-foreground">No pending orders</p>
                      <p className="text-xs text-muted-foreground mt-1">New orders will appear here</p>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {pendingOrders.map((order) => (
                        <Card key={order.id} className="p-4 border-2 hover:border-primary/50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-semibold text-foreground">{order.patientInfo.name}</p>
                              <p className="text-xs text-muted-foreground">{order.patientInfo.emergencyType}</p>
                            </div>
                            <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">NEW</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mb-3">
                            <p>{order.location.address}</p>
                            <p className="text-xs mt-1">{getAmbulanceInfo(order.ambulanceType)?.name}</p>
                          </div>
                          <Button onClick={() => acceptOrder(order)} className="w-full bg-primary hover:bg-primary/90">
                            Accept Order
                          </Button>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
