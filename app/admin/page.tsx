"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Header from "@/components/header"
import { AMBULANCE_TYPES } from "@/lib/ambulance-types"
import { getOrders, DRIVERS, type Order } from "@/lib/order-store"
import {
  fetchNearbyHospitals,
  getCustomHospitals,
  updateHospital,
  saveCustomHospitals,
  type NearbyHospital,
} from "@/lib/hospital-service"
import { MapPin, Phone, Bed, Activity, RefreshCw, Edit2, Check, X, Plus, Navigation } from "lucide-react"

export default function AdminPanel() {
  const [orders, setOrders] = useState<Order[]>([])
  const [hospitals, setHospitals] = useState<NearbyHospital[]>([])
  const [selectedHospital, setSelectedHospital] = useState<NearbyHospital | null>(null)
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [editingHospital, setEditingHospital] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<NearbyHospital>>({})
  const [showAddHospital, setShowAddHospital] = useState(false)
  const [newHospital, setNewHospital] = useState({
    name: "",
    address: "",
    totalBeds: 100,
    availableBeds: 20,
    icuBeds: 10,
    availableIcuBeds: 5,
    emergencyContact: "",
  })
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    completedToday: 0,
    availableDrivers: 0,
  })

  // Fetch user location and nearby hospitals
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ lat: latitude, lng: longitude })
          await loadHospitals(latitude, longitude)
        },
        async () => {
          // Default to Delhi if geolocation fails
          const defaultLat = 28.6139
          const defaultLng = 77.209
          setUserLocation({ lat: defaultLat, lng: defaultLng })
          await loadHospitals(defaultLat, defaultLng)
        },
      )
    } else {
      const defaultLat = 28.6139
      const defaultLng = 77.209
      setUserLocation({ lat: defaultLat, lng: defaultLng })
      loadHospitals(defaultLat, defaultLng)
    }
  }, [])

  const loadHospitals = async (lat: number, lng: number) => {
    setIsLoadingHospitals(true)
    try {
      // Get hospitals from API
      const nearbyHospitals = await fetchNearbyHospitals(lat, lng, 15)

      // Merge with any custom/edited hospitals from localStorage
      const customHospitals = getCustomHospitals()
      const mergedHospitals = nearbyHospitals.map((h) => {
        const custom = customHospitals.find((c) => c.id === h.id)
        return custom || h
      })

      // Add any purely custom hospitals
      const pureCustom = customHospitals.filter((c) => c.isCustom && !nearbyHospitals.find((h) => h.id === c.id))
      const allHospitals = [...mergedHospitals, ...pureCustom]

      setHospitals(allHospitals)
      if (allHospitals.length > 0) {
        setSelectedHospital(allHospitals[0])
      }
    } catch (error) {
      console.error("Failed to load hospitals:", error)
    } finally {
      setIsLoadingHospitals(false)
    }
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadData = () => {
    const allOrders = getOrders()
    setOrders(allOrders)

    const today = new Date().toDateString()
    const completedToday = allOrders.filter(
      (o) => o.status === "completed" && new Date(o.completedAt || "").toDateString() === today,
    ).length

    setStats({
      totalOrders: allOrders.length,
      activeOrders: allOrders.filter((o) =>
        ["pending", "accepted", "arriving", "arrived", "in_transit"].includes(o.status),
      ).length,
      completedToday,
      availableDrivers: DRIVERS.filter((d) => d.isAvailable).length,
    })
  }

  const handleRefreshHospitals = async () => {
    if (userLocation) {
      await loadHospitals(userLocation.lat, userLocation.lng)
    }
  }

  const startEditingHospital = (hospital: NearbyHospital) => {
    setEditingHospital(hospital.id)
    setEditForm({
      name: hospital.name,
      address: hospital.address,
      totalBeds: hospital.totalBeds,
      availableBeds: hospital.availableBeds,
      icuBeds: hospital.icuBeds,
      availableIcuBeds: hospital.availableIcuBeds,
      emergencyContact: hospital.emergencyContact,
    })
  }

  const saveHospitalEdit = (hospital: NearbyHospital) => {
    const updatedHospital = { ...hospital, ...editForm }
    updateHospital(updatedHospital)
    setHospitals((prev) => prev.map((h) => (h.id === hospital.id ? updatedHospital : h)))
    if (selectedHospital?.id === hospital.id) {
      setSelectedHospital(updatedHospital)
    }
    setEditingHospital(null)
  }

  const handleAddHospital = () => {
    if (!newHospital.name || !userLocation) return

    const hospital: NearbyHospital = {
      id: `CUSTOM_${Date.now()}`,
      name: newHospital.name,
      address: newHospital.address || "Custom Hospital",
      lat: userLocation.lat,
      lng: userLocation.lng,
      distance: 0,
      totalBeds: newHospital.totalBeds,
      availableBeds: newHospital.availableBeds,
      icuBeds: newHospital.icuBeds,
      availableIcuBeds: newHospital.availableIcuBeds,
      emergencyContact: newHospital.emergencyContact || "+91 100",
      isCustom: true,
    }

    const updatedHospitals = [...hospitals, hospital]
    setHospitals(updatedHospitals)
    saveCustomHospitals([...getCustomHospitals(), hospital])
    setShowAddHospital(false)
    setNewHospital({
      name: "",
      address: "",
      totalBeds: 100,
      availableBeds: 20,
      icuBeds: 10,
      availableIcuBeds: 5,
      emergencyContact: "",
    })
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
      cancelled: "bg-red-500/20 text-red-600 border-red-500/30",
    }
    return colors[status] || "bg-muted text-muted-foreground"
  }

  const incomingAmbulances = orders.filter((o) => ["arriving", "in_transit"].includes(o.status))

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Hospital Selector Header */}
        <Card className="p-4 mb-6 border-2">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Hospital Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Manage ambulances, beds, and patient intake</p>
              {userLocation && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Navigation className="w-3 h-3" />
                  Location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Hospital:</span>
                <select
                  className="bg-background border border-border rounded-md px-3 py-2 text-sm flex-1 sm:flex-none sm:min-w-[200px]"
                  value={selectedHospital?.id || ""}
                  onChange={(e) => setSelectedHospital(hospitals.find((h) => h.id === e.target.value) || null)}
                  disabled={isLoadingHospitals}
                >
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.distance.toFixed(1)} km)
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRefreshHospitals} disabled={isLoadingHospitals}>
                  <RefreshCw className={`w-4 h-4 mr-1 ${isLoadingHospitals ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button size="sm" onClick={() => setShowAddHospital(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Hospital
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Add Hospital Modal */}
        {showAddHospital && (
          <Card className="p-6 mb-6 border-2 border-primary/30">
            <h3 className="text-lg font-semibold mb-4">Add New Hospital</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Hospital Name *</Label>
                <Input
                  value={newHospital.name}
                  onChange={(e) => setNewHospital({ ...newHospital, name: e.target.value })}
                  placeholder="Enter hospital name"
                />
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  value={newHospital.address}
                  onChange={(e) => setNewHospital({ ...newHospital, address: e.target.value })}
                  placeholder="Enter address"
                />
              </div>
              <div>
                <Label>Total Beds</Label>
                <Input
                  type="number"
                  value={newHospital.totalBeds}
                  onChange={(e) => setNewHospital({ ...newHospital, totalBeds: Number.parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Available Beds</Label>
                <Input
                  type="number"
                  value={newHospital.availableBeds}
                  onChange={(e) =>
                    setNewHospital({ ...newHospital, availableBeds: Number.parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <Label>ICU Beds</Label>
                <Input
                  type="number"
                  value={newHospital.icuBeds}
                  onChange={(e) => setNewHospital({ ...newHospital, icuBeds: Number.parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Available ICU Beds</Label>
                <Input
                  type="number"
                  value={newHospital.availableIcuBeds}
                  onChange={(e) =>
                    setNewHospital({ ...newHospital, availableIcuBeds: Number.parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Emergency Contact</Label>
                <Input
                  value={newHospital.emergencyContact}
                  onChange={(e) => setNewHospital({ ...newHospital, emergencyContact: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddHospital} disabled={!newHospital.name}>
                Add Hospital
              </Button>
              <Button variant="outline" onClick={() => setShowAddHospital(false)}>
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 border-2">
            <p className="text-xs text-muted-foreground font-semibold">AVAILABLE BEDS</p>
            <p className="text-3xl font-bold text-foreground mt-1">{selectedHospital?.availableBeds || 0}</p>
            <p className="text-xs text-muted-foreground">of {selectedHospital?.totalBeds || 0} total</p>
          </Card>
          <Card className="p-4 border-2">
            <p className="text-xs text-muted-foreground font-semibold">ICU BEDS</p>
            <p className="text-3xl font-bold text-primary mt-1">{selectedHospital?.availableIcuBeds || 0}</p>
            <p className="text-xs text-muted-foreground">of {selectedHospital?.icuBeds || 0} total</p>
          </Card>
          <Card className="p-4 border-2">
            <p className="text-xs text-muted-foreground font-semibold">INCOMING AMBULANCES</p>
            <p className="text-3xl font-bold text-secondary mt-1">{incomingAmbulances.length}</p>
            <p className="text-xs text-muted-foreground">en route</p>
          </Card>
          <Card className="p-4 border-2">
            <p className="text-xs text-muted-foreground font-semibold">TODAY'S ADMISSIONS</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{stats.completedToday}</p>
            <p className="text-xs text-muted-foreground">patients</p>
          </Card>
        </div>

        <Tabs defaultValue="hospitals" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hospitals">Nearby Hospitals</TabsTrigger>
            <TabsTrigger value="incoming">Incoming Ambulances</TabsTrigger>
            <TabsTrigger value="all-orders">All Orders</TabsTrigger>
            <TabsTrigger value="drivers">Drivers</TabsTrigger>
          </TabsList>

          {/* Nearby Hospitals Tab */}
          <TabsContent value="hospitals" className="space-y-4">
            {isLoadingHospitals ? (
              <Card className="p-8 border-2 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-3" />
                <p className="text-muted-foreground">Finding nearby hospitals...</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hospitals.map((hospital) => (
                  <Card
                    key={hospital.id}
                    className={`p-4 border-2 transition-all ${
                      selectedHospital?.id === hospital.id ? "border-primary" : ""
                    }`}
                  >
                    {editingHospital === hospital.id ? (
                      // Edit Mode
                      <div className="space-y-3">
                        <Input
                          value={editForm.name || ""}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          placeholder="Hospital Name"
                          className="font-semibold"
                        />
                        <Input
                          value={editForm.address || ""}
                          onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                          placeholder="Address"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Total Beds</Label>
                            <Input
                              type="number"
                              value={editForm.totalBeds || 0}
                              onChange={(e) =>
                                setEditForm({ ...editForm, totalBeds: Number.parseInt(e.target.value) || 0 })
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Available</Label>
                            <Input
                              type="number"
                              value={editForm.availableBeds || 0}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  availableBeds: Number.parseInt(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-xs">ICU Beds</Label>
                            <Input
                              type="number"
                              value={editForm.icuBeds || 0}
                              onChange={(e) =>
                                setEditForm({ ...editForm, icuBeds: Number.parseInt(e.target.value) || 0 })
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-xs">ICU Available</Label>
                            <Input
                              type="number"
                              value={editForm.availableIcuBeds || 0}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  availableIcuBeds: Number.parseInt(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                        </div>
                        <Input
                          value={editForm.emergencyContact || ""}
                          onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                          placeholder="Emergency Contact"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveHospitalEdit(hospital)}>
                            <Check className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingHospital(null)}>
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground line-clamp-1">{hospital.name}</h3>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <MapPin className="w-3 h-3" />
                              <span className="line-clamp-1">{hospital.address}</span>
                            </div>
                          </div>
                          <Badge variant="outline" className="ml-2 shrink-0">
                            {hospital.distance.toFixed(1)} km
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="p-2 bg-muted/50 rounded-md">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Bed className="w-3 h-3" />
                              Beds
                            </div>
                            <p className="font-semibold text-sm">
                              {hospital.availableBeds}/{hospital.totalBeds}
                            </p>
                          </div>
                          <div className="p-2 bg-primary/10 rounded-md">
                            <div className="flex items-center gap-1 text-xs text-primary">
                              <Activity className="w-3 h-3" />
                              ICU
                            </div>
                            <p className="font-semibold text-sm text-primary">
                              {hospital.availableIcuBeds}/{hospital.icuBeds}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {hospital.emergencyContact}
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => startEditingHospital(hospital)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {hospital.isCustom && (
                          <Badge className="mt-2 bg-secondary/20 text-secondary text-xs">Custom Hospital</Badge>
                        )}
                      </>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Incoming Ambulances Tab */}
          <TabsContent value="incoming" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {incomingAmbulances.length === 0 ? (
                <Card className="p-8 border-2 col-span-2 text-center">
                  <div className="text-4xl mb-3">🏥</div>
                  <p className="text-muted-foreground">No incoming ambulances</p>
                  <p className="text-xs text-muted-foreground mt-1">Ambulances en route will appear here</p>
                </Card>
              ) : (
                incomingAmbulances.map((order) => (
                  <Card key={order.id} className="p-5 border-2">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Badge className={getStatusBadge(order.status)}>
                          {order.status.replace("_", " ").toUpperCase()}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2 font-mono">{order.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">
                          {getAmbulanceInfo(order.ambulanceType)?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{order.driverName}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground font-semibold">PATIENT DETAILS</p>
                        <div className="mt-2 space-y-1">
                          <p className="font-semibold text-foreground">{order.patientInfo.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Age: {order.patientInfo.age} | Gender: {order.patientInfo.gender || "N/A"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Blood Group: {order.patientInfo.bloodGroup || "N/A"}
                          </p>
                          <p className="text-sm text-muted-foreground">Contact: {order.patientInfo.phone}</p>
                        </div>
                      </div>

                      <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
                        <p className="text-xs text-primary font-semibold">EMERGENCY TYPE</p>
                        <p className="font-semibold text-foreground mt-1 capitalize">
                          {order.patientInfo.emergencyType}
                        </p>
                      </div>

                      {order.patientInfo.medicalConditions && (
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                          <p className="text-xs text-yellow-600 font-semibold">MEDICAL CONDITIONS</p>
                          <p className="text-sm text-foreground mt-1">{order.patientInfo.medicalConditions}</p>
                        </div>
                      )}

                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground font-semibold">REQUIREMENTS</p>
                        <div className="mt-2">
                          <p className="text-sm text-foreground">
                            {order.ambulanceType === "icu" || order.ambulanceType === "critical"
                              ? "ICU Bed Required"
                              : "General Bed Required"}
                          </p>
                        </div>
                      </div>

                      {order.patientInfo.notes && (
                        <div className="p-3 bg-secondary/10 border border-secondary/30 rounded-lg">
                          <p className="text-xs text-secondary font-semibold">NOTES</p>
                          <p className="text-sm text-foreground mt-1">{order.patientInfo.notes}</p>
                        </div>
                      )}

                      <div className="pt-2">
                        <Button className="w-full bg-green-600 hover:bg-green-700">Prepare for Arrival</Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* All Orders Tab */}
          <TabsContent value="all-orders" className="space-y-4">
            <Card className="border-2">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-xs font-semibold text-muted-foreground">ORDER ID</th>
                      <th className="text-left p-4 text-xs font-semibold text-muted-foreground">PATIENT</th>
                      <th className="text-left p-4 text-xs font-semibold text-muted-foreground">EMERGENCY</th>
                      <th className="text-left p-4 text-xs font-semibold text-muted-foreground">AMBULANCE</th>
                      <th className="text-left p-4 text-xs font-semibold text-muted-foreground">DRIVER</th>
                      <th className="text-left p-4 text-xs font-semibold text-muted-foreground">STATUS</th>
                      <th className="text-left p-4 text-xs font-semibold text-muted-foreground">TIME</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                          No orders yet
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order.id} className="border-b border-border hover:bg-muted/50">
                          <td className="p-4 font-mono text-xs">{order.id}</td>
                          <td className="p-4">
                            <p className="font-semibold text-sm">{order.patientInfo.name}</p>
                            <p className="text-xs text-muted-foreground">Age: {order.patientInfo.age}</p>
                          </td>
                          <td className="p-4 text-sm capitalize">{order.patientInfo.emergencyType}</td>
                          <td className="p-4 text-sm">{getAmbulanceInfo(order.ambulanceType)?.name}</td>
                          <td className="p-4 text-sm">{order.driverName || "-"}</td>
                          <td className="p-4">
                            <Badge className={getStatusBadge(order.status)}>{order.status.replace("_", " ")}</Badge>
                          </td>
                          <td className="p-4 text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Drivers Tab */}
          <TabsContent value="drivers" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DRIVERS.map((driver) => {
                const driverOrder = orders.find(
                  (o) =>
                    o.driverId === driver.id && ["accepted", "arriving", "arrived", "in_transit"].includes(o.status),
                )

                return (
                  <Card key={driver.id} className="p-5 border-2">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-xl text-primary-foreground font-semibold">
                        {driver.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-foreground">{driver.name}</h3>
                          <Badge
                            className={driverOrder ? "bg-primary/20 text-primary" : "bg-green-500/20 text-green-600"}
                          >
                            {driverOrder ? "On Duty" : "Available"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{driver.vehicleNumber}</p>
                        <p className="text-xs text-muted-foreground">{getAmbulanceInfo(driver.ambulanceType)?.name}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-muted-foreground">Rating: {driver.rating}/5</span>
                          <span className="text-xs text-muted-foreground">{driver.totalRides} rides</span>
                        </div>
                        {driverOrder && (
                          <div className="mt-3 p-2 bg-muted/50 rounded text-xs">
                            <p className="text-muted-foreground">Current: {driverOrder.patientInfo.name}</p>
                            <p className="text-muted-foreground capitalize">
                              Status: {driverOrder.status.replace("_", " ")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
