"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"
import Link from "next/link"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }

    // Load all orders from localStorage (simulated history)
    const currentOrder = localStorage.getItem("currentOrder")
    if (currentOrder) {
      const order = JSON.parse(currentOrder)
      setOrders([order])
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Profile</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, <span className="font-semibold text-foreground">{user?.name}</span>
            </p>
          </div>
          <Link href="/book">
            <Button className="bg-primary hover:bg-primary/90 h-11 font-semibold">+ Book Ambulance</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {[
            { label: "Total Rides", value: orders.length, icon: "🚑", color: "from-primary/10" },
            {
              label: "Emergency Type",
              value: orders.length > 0 ? orders[0].emergencyType || "Medical" : "None",
              icon: "❤️",
              color: "from-red-500/10",
            },
          ].map((stat, i) => (
            <Card key={i} className={`p-6 border-2 bg-gradient-to-br ${stat.color} to-transparent`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-semibold">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                </div>
                <div className="text-4xl">{stat.icon}</div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6 border-2">
          <h2 className="text-2xl font-bold text-foreground mb-6">Recent Orders</h2>
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📦</div>
              <p className="text-muted-foreground text-lg mb-4">No orders yet</p>
              <Link href="/book">
                <Button className="bg-primary hover:bg-primary/90 h-11 font-semibold">Book Your First Ambulance</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-left py-4 px-4 font-bold text-foreground">Order ID</th>
                    <th className="text-left py-4 px-4 font-bold text-foreground">Patient</th>
                    <th className="text-left py-4 px-4 font-bold text-foreground">Type</th>
                    <th className="text-left py-4 px-4 font-bold text-foreground">Status</th>
                    <th className="text-left py-4 px-4 font-bold text-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-border hover:bg-card transition">
                      <td className="py-4 px-4 font-mono text-sm text-foreground font-semibold">{order.id}</td>
                      <td className="py-4 px-4 text-foreground font-medium">{order.patientInfo.name}</td>
                      <td className="py-4 px-4">
                        <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-semibold capitalize">
                          {order.ambulanceType}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-sm font-semibold capitalize">
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Link href="/tracking">
                          <Button variant="outline" size="sm" className="font-semibold bg-transparent">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}
