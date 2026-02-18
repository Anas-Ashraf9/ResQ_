"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import Header from "@/components/header"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ email: string; name: string } | null>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
      setIsLoggedIn(true)
    }
  }, [])

  const features = [
    {
      icon: "⚡",
      title: "5-Minute Response",
      description: "Average arrival time of 5 minutes in urban areas",
    },
    {
      icon: "🗺️",
      title: "Real-time Tracking",
      description: "Track your ambulance live on interactive maps",
    },
    {
      icon: "👨‍⚕️",
      title: "Professional Staff",
      description: "Trained paramedics and medical professionals",
    },
    {
      icon: "🏥",
      title: "Hospital Network",
      description: "Direct integration with major hospitals",
    },
    {
      icon: "📱",
      title: "Easy Booking",
      description: "Simple one-tap ambulance ordering",
    },
    {
      icon: "24",
      title: "24/7 Service",
      description: "Round-the-clock emergency medical transport",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <section className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block mb-4 bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-semibold">
                ✓ Available 24/7
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight text-balance">
                Emergency Medical Transport, <span className="text-primary">Always Ready</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 text-balance">
                Fast, reliable ambulance booking service with professional paramedics. Get emergency medical transport
                in minutes with real-time tracking and hospital integration.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {isLoggedIn ? (
                  <Link href="/book" className="flex-1 sm:flex-none">
                    <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 h-12 text-base">
                      Book Ambulance Now
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login" className="flex-1 sm:flex-none">
                      <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 h-12 text-base">
                        Get Started
                      </Button>
                    </Link>
                    <Link href="/signup" className="flex-1 sm:flex-none">
                      <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 text-base bg-transparent">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="relative h-80 sm:h-96 lg:h-full rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/10 backdrop-blur-3xl" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl mb-6 animate-bounce">🚑</div>
                  <p className="text-xl font-semibold text-foreground">Professional Emergency Transport</p>
                  <p className="text-sm text-muted-foreground mt-2">Available in your area</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-card/50 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Why Choose ResQ</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                We provide fast, reliable, and professional emergency medical transport services
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <Card key={i} className="p-6 border-2 hover:border-primary/50 transition hover:shadow-lg">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <Card className="p-8 sm:p-12 border-2 bg-gradient-to-r from-primary/10 to-secondary/10">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Need an Ambulance?</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                {isLoggedIn
                  ? "Book your ambulance now and get professional medical transport to your hospital."
                  : "Sign up or login to book an ambulance for emergency medical transport."}
              </p>
              {isLoggedIn ? (
                <Link href="/book">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 h-12 text-base">
                    Book Now
                  </Button>
                </Link>
              ) : (
                <Link href="/signup">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 h-12 text-base">
                    Create Free Account
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        </section>

        <footer className="border-t border-border bg-card/50 py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                    R
                  </div>
                  <span className="font-bold text-foreground">ResQ</span>
                </div>
                <p className="text-sm text-muted-foreground">Emergency medical transport service</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-3">Service</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link href="/book" className="hover:text-foreground">
                      Book Ambulance
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard" className="hover:text-foreground">
                      Dashboard
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-3">About</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a href="#" className="hover:text-foreground">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-3">Legal</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a href="#" className="hover:text-foreground">
                      Privacy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground">
                      Terms
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
              <p>&copy; 2025 ResQ. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
