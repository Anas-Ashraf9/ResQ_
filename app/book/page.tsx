"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import dynamic from "next/dynamic"
const MapComponent = dynamic(() => import("@/components/map-component"), { ssr: false })
import AmbulanceTypeCard from "@/components/ambulance-type-card"
import { AMBULANCE_TYPES } from "@/lib/ambulance-types"
import { saveOrder, type Order } from "@/lib/order-store"
import { AlertTriangle, Phone, User, Calendar, Heart, FileText, CheckCircle2 } from "lucide-react"
import VoiceCommand, { type VoiceCommandResult } from "@/components/voice-command"
import { validatePatientInfo, validatePhone, validateAge } from "@/lib/form-validator"

export default function BookPage() {
  const [step, setStep] = useState<"location" | "ambulance" | "confirm">("location")
  const [location, setLocation] = useState({ lat: 28.6139, lng: 77.209, address: "" })
  const [ambulanceType, setAmbulanceType] = useState("")
  const [loading, setLoading] = useState(true)
  const [isRoadAccident, setIsRoadAccident] = useState(false)
  const [voiceActive, setVoiceActive] = useState(false)
  const [patientInfo, setPatientInfo] = useState({
    name: "",
    phone: "",
    age: "",
    gender: "",
    bloodGroup: "",
    emergencyType: "",
    emergencyContact: "",
    emergencyContactName: "",
    medicalConditions: "",
    allergies: "",
    currentMedications: "",
    notes: "",
    isConscious: true,
    isBreathing: true,
    visibleInjuries: "",
    numberOfPatients: "1",
  })
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: "Current Location",
          })
          setLoading(false)
        },
        () => {
          setLoading(false)
        },
      )
    }
  }, [])

  const handleRoadAccidentToggle = (checked: boolean) => {
    setIsRoadAccident(checked)
    if (checked) {
      setPatientInfo((prev) => ({
        ...prev,
        emergencyType: "road_accident",
      }))
      setAmbulanceType("icu") // Auto-select ICU ambulance for road accidents
    } else {
      setPatientInfo((prev) => ({
        ...prev,
        emergencyType: "",
      }))
      setAmbulanceType("")
    }
  }

  const handleQuickOrder = () => {
    if (!patientInfo.phone) {
      alert("Please enter at least a phone number for emergency contact")
      return
    }

    const order: Order = {
      id: "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      customerId: user?.email || "guest",
      customerName: user?.name || patientInfo.name || "Road Accident Victim",
      customerPhone: patientInfo.phone,
      location: {
        lat: location.lat,
        lng: location.lng,
        address: location.address || "Current Location",
      },
      ambulanceType: "icu",
      patientInfo: {
        ...patientInfo,
        name: patientInfo.name || "Road Accident Victim",
        emergencyType: "road_accident",
      },
      status: "pending",
      createdAt: new Date().toISOString(),
      isEmergency: true,
    }

    saveOrder(order)
    localStorage.setItem("currentOrder", JSON.stringify(order))
    router.push("/tracking")
  }

  const handleLocationSelect = () => {
    setStep("ambulance")
  }

  const handleAmbulanceSelect = (type: string) => {
    setAmbulanceType(type)
    setStep("confirm")
  }

  const handleConfirmOrder = () => {
    const order: Order = {
      id: "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      customerId: user?.email || "guest",
      customerName: user?.name || patientInfo.name,
      customerPhone: patientInfo.phone,
      location: {
        lat: location.lat,
        lng: location.lng,
        address: location.address || "Current Location",
      },
      ambulanceType,
      patientInfo: {
        name: patientInfo.name,
        age: patientInfo.age,
        gender: patientInfo.gender,
        bloodGroup: patientInfo.bloodGroup,
        emergencyType: patientInfo.emergencyType,
        phone: patientInfo.phone,
        emergencyContact: patientInfo.emergencyContact,
        emergencyContactName: patientInfo.emergencyContactName,
        medicalConditions: patientInfo.medicalConditions,
        allergies: patientInfo.allergies,
        currentMedications: patientInfo.currentMedications,
        isConscious: patientInfo.isConscious,
        isBreathing: patientInfo.isBreathing,
        visibleInjuries: patientInfo.visibleInjuries,
        numberOfPatients: patientInfo.numberOfPatients,
        notes: patientInfo.notes,
      },
      status: "pending",
      createdAt: new Date().toISOString(),
      isEmergency: isRoadAccident,
    }

    saveOrder(order)
    localStorage.setItem("currentOrder", JSON.stringify(order))
    router.push("/tracking")
  }

  const handleVoiceCommand = (command: VoiceCommandResult) => {
    console.log("[v0] Voice command received:", command)

    if (command.field === "command" && command.value === "emergency") {
      setIsRoadAccident(true)
      setStep("location")
      // Auto-fill emergency type
      setPatientInfo((prev) => ({ ...prev, emergencyType: "road_accident" }))
      return
    }

    if (command.field === "command") {
      if (command.value === "book" && step === "confirm") {
        handleConfirmOrder()
      } else if (command.value === "cancel") {
        setVoiceActive(false)
      }
      return
    }

    if (command.field === "name") {
      setPatientInfo((prev) => ({ ...prev, name: command.value }))
    } else if (command.field === "age") {
      setPatientInfo((prev) => ({ ...prev, age: command.value }))
    } else if (command.field === "phone") {
      setPatientInfo((prev) => ({ ...prev, phone: command.value }))
    } else if (command.field === "gender") {
      setPatientInfo((prev) => ({ ...prev, gender: command.value }))
    } else if (command.field === "bloodGroup") {
      setPatientInfo((prev) => ({ ...prev, bloodGroup: command.value }))
    } else if (command.field === "emergencyType") {
      setPatientInfo((prev) => ({ ...prev, emergencyType: command.value }))
    } else if (command.field === "ambulanceType") {
      setAmbulanceType(command.value)
      if (step === "ambulance") {
        setTimeout(() => setStep("confirm"), 1000)
      }
    } else if (command.field === "location") {
      setLocation((prev) => ({ ...prev, address: command.value }))
    }
  }

  const isPatientInfoValid = patientInfo.name && patientInfo.phone && patientInfo.emergencyType && patientInfo.age

  const handlePhoneChange = (value: string) => {
    const sanitized = value.replace(/\D/g, "")
    if (sanitized.length <= 10) {
      setPatientInfo({ ...patientInfo, phone: sanitized })
    }

    if (sanitized.length === 10) {
      const validation = validatePhone(sanitized)
      if (!validation.isValid) {
        setValidationErrors({ ...validationErrors, phone: validation.error || "" })
      } else {
        const { phone, ...rest } = validationErrors
        setValidationErrors(rest)
      }
    }
  }

  const handleEmergencyPhoneChange = (value: string) => {
    const sanitized = value.replace(/\D/g, "")
    if (sanitized.length <= 10) {
      setPatientInfo({ ...patientInfo, emergencyContact: sanitized })
    }
  }

  const handleAgeChange = (value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(0, 3)
    setPatientInfo({ ...patientInfo, age: sanitized })

    if (sanitized) {
      const validation = validateAge(sanitized)
      if (!validation.isValid) {
        setValidationErrors({ ...validationErrors, age: validation.error || "" })
      } else {
        const { age, ...rest } = validationErrors
        setValidationErrors(rest)
      }
    }
  }

  const handleContinueToConfirm = () => {
    const validation = validatePatientInfo({
      name: patientInfo.name,
      phone: patientInfo.phone,
      age: patientInfo.age,
      emergencyType: patientInfo.emergencyType,
    })

    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      return
    }

    setValidationErrors({})
    setStep("confirm")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Road Accident Emergency Banner */}
        <Card
          className={`p-4 mb-6 border-2 transition-all ${isRoadAccident ? "bg-red-500/10 border-red-500" : "bg-orange-500/5 border-orange-500/30"}`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className={`p-3 rounded-full ${isRoadAccident ? "bg-red-500" : "bg-orange-500"}`}>
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Road Accident Emergency</h3>
                <p className="text-sm text-muted-foreground">
                  Quick ambulance booking for road accidents - ICU ambulance will be dispatched immediately
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRoadAccident}
                  onChange={(e) => handleRoadAccidentToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>
          </div>

          {/* Quick Order Form for Road Accident */}
          {isRoadAccident && (
            <div className="mt-4 pt-4 border-t border-red-500/30">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Patient Name (if known)"
                  value={patientInfo.name}
                  onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
                  className="px-4 py-2 border border-red-500/30 rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
                <input
                  type="tel"
                  inputMode="numeic"
                  maxLength={10}
                  placeholder="🇮🇳+91 Your Phone Number *"
                  value={patientInfo.phone}
                  onChange={(e) => setPatientInfo({ ...patientInfo, phone: e.target.value })}
                  className="px-4 py-2 border border-red-500/30 rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
                <input
                  type="text"
                  placeholder="Number of Patients"
                  value={patientInfo.numberOfPatients}
                  onChange={(e) => setPatientInfo({ ...patientInfo, numberOfPatients: e.target.value })}
                  className="px-4 py-2 border border-red-500/30 rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
                <input
                  type="text"
                  placeholder="Visible Injuries"
                  value={patientInfo.visibleInjuries}
                  onChange={(e) => setPatientInfo({ ...patientInfo, visibleInjuries: e.target.value })}
                  className="px-4 py-2 border border-red-500/30 rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </div>
              <div className="flex flex-wrap gap-4 mb-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={patientInfo.isConscious}
                    onChange={(e) => setPatientInfo({ ...patientInfo, isConscious: e.target.checked })}
                    className="w-4 h-4 accent-red-500"
                  />
                  <span className="text-foreground">Patient is Conscious</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={patientInfo.isBreathing}
                    onChange={(e) => setPatientInfo({ ...patientInfo, isBreathing: e.target.checked })}
                    className="w-4 h-4 accent-red-500"
                  />
                  <span className="text-foreground">Patient is Breathing Normally</span>
                </label>
              </div>
              <Button
                onClick={handleQuickOrder}
                disabled={!patientInfo.phone}
                className="w-full bg-red-500 hover:bg-red-600 text-white h-12 text-base font-bold"
              >
                <AlertTriangle className="w-5 h-5 mr-2" />
                DISPATCH ICU AMBULANCE NOW
              </Button>
            </div>
          )}
        </Card>

        {/* Voice Command Component */}
        <div className="mb-6">
          <VoiceCommand
            onCommand={handleVoiceCommand}
            isActive={voiceActive}
            onToggle={() => setVoiceActive(!voiceActive)}
          />
        </div>

        {/* Step Indicator */}
        <div className="flex gap-2 sm:gap-4 mb-8 px-2">
          {["location", "ambulance", "confirm"].map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1 sm:flex-none">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition ${
                  step === s || (step === "ambulance" && s === "location") || (step === "confirm" && s !== "confirm")
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </div>
              <span className="text-xs sm:text-sm font-medium text-foreground hidden sm:inline">
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </span>
              {i < 2 && <div className="flex-1 h-0.5 bg-border mx-1 sm:mx-2 hidden sm:block" />}
            </div>
          ))}
        </div>

        {/* Location Step */}
        {step === "location" && (
          <Card className="p-6 sm:p-8 border-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Your Location & Patient Details</h2>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground animate-pulse">Getting your location...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-card rounded-lg overflow-hidden border border-border shadow-sm h-80">
                  <MapComponent latitude={location.lat} longitude={location.lng} markerColor="red" zoom={15} />
                </div>

                <div className="bg-secondary/10 rounded-lg p-4 border border-secondary/20">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Current Location</p>
                  <p className="text-lg font-semibold text-foreground">{location.address}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {location.lat.toFixed(4)}N, {location.lng.toFixed(4)}E
                  </p>
                </div>

                {/* Patient Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <User className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-foreground">Patient Information</h3>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Patient Name *"
                        value={patientInfo.name}
                        onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${validationErrors.name ? "border-red-500" : "border-border"}`}
                      />
                      {validationErrors.name && <p className="text-xs text-red-500 mt-1">{validationErrors.name}</p>}
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Age *"
                        value={patientInfo.age}
                        onChange={(e) => handleAgeChange(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${validationErrors.age ? "border-red-500" : "border-border"}`}
                      />
                      {validationErrors.age && <p className="text-xs text-red-500 mt-1">{validationErrors.age}</p>}
                    </div>
                    <select
                      value={patientInfo.gender}
                      onChange={(e) => setPatientInfo({ ...patientInfo, gender: e.target.value })}
                      className="w-full px-4 py-2.5 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                    >
                      <option value="">Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <select
                      value={patientInfo.bloodGroup}
                      onChange={(e) => setPatientInfo({ ...patientInfo, bloodGroup: e.target.value })}
                      className="w-full px-4 py-2.5 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                    >
                      <option value="">Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="flex items-center border rounded-lg overflow-hidden bg-card focus-within:ring-2 focus-within:ring-primary/50">
                      <div className="bg-muted px-3 py-2.5 text-sm font-medium text-foreground select-none border-r border-border flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        🇮🇳 +91
                      </div>
                      <input
                        type="tel"
                        inputMode="numeric"
                        placeholder="Patient Phone (10 digits) *"
                        value={patientInfo.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        maxLength={10}
                        className={`flex-1 px-3 py-2.5 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none ${validationErrors.phone ? "text-red-500" : ""}`}
                      />
                    </div>
                    <select
                      value={patientInfo.emergencyType}
                      onChange={(e) => setPatientInfo({ ...patientInfo, emergencyType: e.target.value })}
                      className="w-full px-4 py-2.5 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                    >
                      <option value="">Select Emergency Type *</option>
                      <option value="road_accident">Road Accident</option>
                      <option value="trauma">Trauma / Injury</option>
                      <option value="cardiac">Cardiac Emergency</option>
                      <option value="respiratory">Respiratory Issues</option>
                      <option value="stroke">Stroke Suspected</option>
                      <option value="pregnancy">Pregnancy Related</option>
                      <option value="pediatric">Pediatric Emergency</option>
                      <option value="burns">Burns</option>
                      <option value="poisoning">Poisoning</option>
                      <option value="unconscious">Unconscious Patient</option>
                      <option value="other">Other Medical</option>
                    </select>
                  </div>

                  {/* Emergency Contact */}
                  <div className="flex items-center gap-2 pb-2 border-b border-border mt-6">
                    <Phone className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-foreground">Emergency Contact</h3>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Emergency Contact Name"
                      value={patientInfo.emergencyContactName}
                      onChange={(e) => setPatientInfo({ ...patientInfo, emergencyContactName: e.target.value })}
                      className="px-4 py-2.5 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <div className="flex items-center border border-border rounded-lg overflow-hidden bg-card focus-within:ring-2 focus-within:ring-primary/50">
                      <div className="bg-muted px-3 py-2.5 text-sm font-medium text-foreground select-none border-r border-border">
                        🇮🇳 +91
                      </div>
                      <input
                        type="tel"
                        inputMode="numeric"
                        placeholder="Emergency Contact Phone"
                        value={patientInfo.emergencyContact}
                        onChange={(e) => handleEmergencyPhoneChange(e.target.value)}
                        maxLength={10}
                        className="flex-1 px-3 py-2.5 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Medical History */}
                  <div className="flex items-center gap-2 pb-2 border-b border-border mt-6">
                    <Heart className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-foreground">Medical History (Optional)</h3>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Medical Conditions (e.g., Diabetes)"
                      value={patientInfo.medicalConditions}
                      onChange={(e) => setPatientInfo({ ...patientInfo, medicalConditions: e.target.value })}
                      className="px-4 py-2.5 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <input
                      type="text"
                      placeholder="Allergies"
                      value={patientInfo.allergies}
                      onChange={(e) => setPatientInfo({ ...patientInfo, allergies: e.target.value })}
                      className="px-4 py-2.5 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <input
                      type="text"
                      placeholder="Current Medications"
                      value={patientInfo.currentMedications}
                      onChange={(e) => setPatientInfo({ ...patientInfo, currentMedications: e.target.value })}
                      className="px-4 py-2.5 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  {/* Current Status */}
                  <div className="flex items-center gap-2 pb-2 border-b border-border mt-6">
                    <FileText className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-foreground">Current Patient Status</h3>
                  </div>

                  <div className="flex flex-wrap gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={patientInfo.isConscious}
                        onChange={(e) => setPatientInfo({ ...patientInfo, isConscious: e.target.checked })}
                        className="w-5 h-5 accent-primary rounded"
                      />
                      <span className="text-foreground">Patient is Conscious</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={patientInfo.isBreathing}
                        onChange={(e) => setPatientInfo({ ...patientInfo, isBreathing: e.target.checked })}
                        className="w-5 h-5 accent-primary rounded"
                      />
                      <span className="text-foreground">Patient is Breathing Normally</span>
                    </label>
                  </div>

                  <textarea
                    placeholder="Additional Notes - Describe the situation, visible injuries, or any other important details"
                    value={patientInfo.notes}
                    onChange={(e) => setPatientInfo({ ...patientInfo, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>

                <Button onClick={handleContinueToConfirm} className="w-full" disabled={!isPatientInfoValid}>
                  Continue to Ambulance Selection
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Ambulance Selection Step */}
        {step === "ambulance" && (
          <Card className="p-6 sm:p-8 border-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Select Ambulance Type</h2>
            <p className="text-muted-foreground mb-8">Choose the ambulance that best suits your medical needs</p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {AMBULANCE_TYPES.map((type) => (
                <AmbulanceTypeCard
                  key={type.id}
                  {...type}
                  isSelected={ambulanceType === type.id}
                  onClick={() => handleAmbulanceSelect(type.id)}
                />
              ))}
            </div>

            {ambulanceType && (
              <Button
                onClick={() => setStep("confirm")}
                className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-semibold mt-8"
              >
                Continue to Confirmation
              </Button>
            )}
          </Card>
        )}

        {/* Confirmation Step */}
        {step === "confirm" && (
          <Card className="p-6 sm:p-8 border-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Confirm Your Order</h2>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Left Column - Location & Ambulance */}
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">PICKUP LOCATION</p>
                  <p className="text-lg font-semibold text-foreground">{location.address}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {location.lat.toFixed(4)}N, {location.lng.toFixed(4)}E
                  </p>
                </div>

                <div className="bg-primary/10 border-2 border-primary/30 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">AMBULANCE TYPE</p>
                  <p className="text-lg font-semibold text-primary">
                    {AMBULANCE_TYPES.find((t) => t.id === ambulanceType)?.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {AMBULANCE_TYPES.find((t) => t.id === ambulanceType)?.description}
                  </p>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">EMERGENCY TYPE</p>
                  <p className="text-lg font-semibold text-foreground capitalize">
                    {patientInfo.emergencyType.replace(/_/g, " ")}
                  </p>
                </div>
              </div>

              {/* Right Column - Patient Details */}
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground font-semibold mb-2">PATIENT DETAILS</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-semibold text-foreground">{patientInfo.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Age:</span>
                      <span className="font-semibold text-foreground">{patientInfo.age}</span>
                    </div>
                    {patientInfo.gender && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gender:</span>
                        <span className="font-semibold text-foreground capitalize">{patientInfo.gender}</span>
                      </div>
                    )}
                    {patientInfo.bloodGroup && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Blood Group:</span>
                        <span className="font-semibold text-foreground">{patientInfo.bloodGroup}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-semibold text-foreground">{patientInfo.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground font-semibold mb-2">PATIENT STATUS</p>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className={`w-4 h-4 ${patientInfo.isConscious ? "text-green-500" : "text-red-500"}`}
                      />
                      <span className="text-sm text-foreground">
                        {patientInfo.isConscious ? "Conscious" : "Unconscious"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className={`w-4 h-4 ${patientInfo.isBreathing ? "text-green-500" : "text-red-500"}`}
                      />
                      <span className="text-sm text-foreground">
                        {patientInfo.isBreathing ? "Breathing" : "Not Breathing"}
                      </span>
                    </div>
                  </div>
                </div>

                {(patientInfo.medicalConditions || patientInfo.allergies) && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <p className="text-xs text-yellow-600 font-semibold mb-2">MEDICAL ALERTS</p>
                    {patientInfo.medicalConditions && (
                      <p className="text-sm text-foreground">
                        <span className="font-medium">Conditions:</span> {patientInfo.medicalConditions}
                      </p>
                    )}
                    {patientInfo.allergies && (
                      <p className="text-sm text-foreground">
                        <span className="font-medium">Allergies:</span> {patientInfo.allergies}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handleConfirmOrder}
              className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-semibold mb-3"
            >
              Confirm & Book Ambulance
            </Button>
            <Button onClick={() => setStep("ambulance")} variant="outline" className="w-full">
              Go Back
            </Button>
          </Card>
        )}
      </main>
    </div>
  )
}
