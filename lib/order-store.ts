// Shared order store for managing orders across customer, driver, and admin panels

export interface PatientInfo {
  name: string
  age: string
  gender?: string
  bloodGroup?: string
  emergencyType: string
  phone: string
  emergencyContact?: string
  emergencyContactName?: string
  medicalConditions?: string
  allergies?: string
  currentMedications?: string
  isConscious?: boolean
  isBreathing?: boolean
  visibleInjuries?: string
  numberOfPatients?: string
  notes?: string
}

export interface Order {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  location: {
    lat: number
    lng: number
    address: string
  }
  destination?: {
    lat: number
    lng: number
    address: string
    hospitalName: string
  }
  ambulanceType: string
  patientInfo: PatientInfo
  status: "pending" | "accepted" | "arriving" | "arrived" | "in_transit" | "completed" | "cancelled"
  driverId?: string
  driverName?: string
  driverPhone?: string
  createdAt: string
  acceptedAt?: string
  arrivedAt?: string
  completedAt?: string
  isEmergency?: boolean
}

export interface Driver {
  id: string
  name: string
  phone: string
  ambulanceType: string
  vehicleNumber: string
  isAvailable: boolean
  currentOrderId?: string
  rating: number
  totalRides: number
  location: { lat: number; lng: number }
}

export interface Hospital {
  id: string
  name: string
  address: string
  totalBeds: number
  availableBeds: number
  icuBeds: number
  availableIcuBeds: number
  emergencyContact: string
}

// Sample drivers database
export const DRIVERS: Driver[] = [
  {
    id: "DRV001",
    name: "Rajesh Kumar",
    phone: "+91 98765 43210",
    ambulanceType: "icu",
    vehicleNumber: "DL-01-AB-1234",
    isAvailable: true,
    rating: 4.9,
    totalRides: 245,
    location: { lat: 28.6139, lng: 77.209 },
  },
  {
    id: "DRV002",
    name: "Amit Sharma",
    phone: "+91 98765 43211",
    ambulanceType: "basic",
    vehicleNumber: "DL-01-CD-5678",
    isAvailable: true,
    rating: 4.8,
    totalRides: 189,
    location: { lat: 28.62, lng: 77.215 },
  },
  {
    id: "DRV003",
    name: "Priya Singh",
    phone: "+91 98765 43212",
    ambulanceType: "critical",
    vehicleNumber: "DL-01-EF-9012",
    isAvailable: true,
    rating: 4.95,
    totalRides: 312,
    location: { lat: 28.605, lng: 77.2 },
  },
  {
    id: "DRV004",
    name: "Vikram Patel",
    phone: "+91 98765 43213",
    ambulanceType: "neonatal",
    vehicleNumber: "DL-01-GH-3456",
    isAvailable: true,
    rating: 4.85,
    totalRides: 156,
    location: { lat: 28.618, lng: 77.21 },
  },
]

// Sample hospitals database
export const HOSPITALS: Hospital[] = [
  {
    id: "HOSP001",
    name: "Apollo Hospital",
    address: "Sarita Vihar, Delhi",
    totalBeds: 500,
    availableBeds: 45,
    icuBeds: 50,
    availableIcuBeds: 8,
    emergencyContact: "+91 11 2987 1234",
  },
  {
    id: "HOSP002",
    name: "AIIMS Delhi",
    address: "Ansari Nagar, Delhi",
    totalBeds: 2500,
    availableBeds: 120,
    icuBeds: 200,
    availableIcuBeds: 15,
    emergencyContact: "+91 11 2658 8500",
  },
  {
    id: "HOSP003",
    name: "Max Super Speciality",
    address: "Saket, Delhi",
    totalBeds: 400,
    availableBeds: 32,
    icuBeds: 45,
    availableIcuBeds: 5,
    emergencyContact: "+91 11 2651 5050",
  },
]

// Helper functions for order management
export function getOrders(): Order[] {
  if (typeof window === "undefined") return []
  const orders = localStorage.getItem("allOrders")
  return orders ? JSON.parse(orders) : []
}

export function saveOrder(order: Order): void {
  const orders = getOrders()
  const existingIndex = orders.findIndex((o) => o.id === order.id)
  if (existingIndex >= 0) {
    orders[existingIndex] = order
  } else {
    orders.push(order)
  }
  localStorage.setItem("allOrders", JSON.stringify(orders))
}

export function updateOrderStatus(
  orderId: string,
  status: Order["status"],
  additionalData?: Partial<Order>,
): Order | null {
  const orders = getOrders()
  const orderIndex = orders.findIndex((o) => o.id === orderId)
  if (orderIndex >= 0) {
    orders[orderIndex] = { ...orders[orderIndex], status, ...additionalData }
    localStorage.setItem("allOrders", JSON.stringify(orders))
    return orders[orderIndex]
  }
  return null
}

export function getPendingOrders(): Order[] {
  return getOrders().filter((o) => o.status === "pending")
}

export function getActiveOrders(): Order[] {
  return getOrders().filter((o) => ["accepted", "arriving", "arrived", "in_transit"].includes(o.status))
}

export function getDriverOrders(driverId: string): Order[] {
  return getOrders().filter((o) => o.driverId === driverId)
}
