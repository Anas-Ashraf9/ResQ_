"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface PanicToolsProps {
  open: boolean
  onClose: () => void
}

export default function PanicTools({ open, onClose }: PanicToolsProps) {
  const [activeMode, setActiveMode] = useState<"menu" | "cpr" | "bleeding" | "choking" | "heart" | "breathing">("menu")
  const [cprCount, setCprCount] = useState(0)
  const [cprActive, setCprActive] = useState(false)
  const [breathCount, setBreathCount] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (cprActive) {
      // CPR rate: 100-120 compressions per minute (500-600ms per beat)
      interval = setInterval(() => {
        setCprCount((prev) => {
          const newCount = prev + 1
          // Play beep sound
          if (typeof window !== "undefined") {
            const beep = new Audio(
              "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2i78OScTgwOUKni8LJiGwU7kdvyx3krBSF1w+zffTsIGGS37OmjTwwKTqXh8bRgGgU6kdvyx3YpBR9zwe7egjsIF2Oz7OykTgwJTKPh8bJfGgU7kdvyx3YpBSJzwe7egjsIF2S07OelTgwJTKTh8bJfGgU7kdvyx3YpBSJ1we7egjsIF2Oz7OelTwwKTKTh8bNfGgU7kdvyx3YpBSJ1we7dgjsIF2S07OelTwwKTKPh8bJfGgU7kdvyx3YpBSJ1we7dgjsIF2S07OelTwwKTKTh8bNfGgU7kdvyx3YpBSJ1we7dgjsIF2S07OelTwwKTKTh8bNfGgU7kdvyx3YpBSJ1we7dgjsIF2S07OelTwwKTKTh8bNfGgU7kdvyx3YpBSJ1we7dgjsIF2S07OelTwwKTKTh8bNfGgU7kdvyx3YpBSJ1we7dgjsIF2S07OelTwwKTKTh8bNfGgU7kdvyx3YpBSJ1we7dgjsIF2S07OelTwwKTKTh8bNfGgU7kdvyx3YpBSJ1we7dgjsIF2S07OelTwwKTKTh8bNfGgU7kdvyx3YpBSJ1we7dgjsIF2S07OelTwwKTKTh8Q==",
            )
            beep.play().catch(() => {})
          }
          return newCount
        })

        // After 30 compressions, prompt for 2 rescue breaths
        if (cprCount > 0 && cprCount % 30 === 0) {
          setBreathCount((prev) => prev + 1)
          setCprActive(false)
        }
      }, 550) // ~109 compressions per minute
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [cprActive, cprCount])

  const startCPR = () => {
    setCprActive(true)
    setCprCount(0)
    setBreathCount(0)
  }

  const continueCPR = () => {
    setCprActive(true)
  }

  const resetCPR = () => {
    setCprActive(false)
    setCprCount(0)
    setBreathCount(0)
  }

  const renderMenu = () => (
    <div className="space-y-4">
      <DialogDescription className="text-sm text-muted-foreground">
        Select an emergency tool to get immediate guidance. These tools are for emergency situations while waiting for
        professional medical help.
      </DialogDescription>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          onClick={() => setActiveMode("cpr")}
          className="h-24 flex-col gap-2 bg-red-600 hover:bg-red-700 text-white"
        >
          <span className="text-3xl">❤️</span>
          <span className="font-semibold">CPR Pacer</span>
        </Button>

        <Button
          onClick={() => setActiveMode("heart")}
          className="h-24 flex-col gap-2 bg-orange-600 hover:bg-orange-700 text-white"
        >
          <span className="text-3xl">💔</span>
          <span className="font-semibold">Heart Attack</span>
        </Button>

        <Button
          onClick={() => setActiveMode("choking")}
          className="h-24 flex-col gap-2 bg-purple-600 hover:bg-purple-700 text-white"
        >
          <span className="text-3xl">🫁</span>
          <span className="font-semibold">Choking</span>
        </Button>

        <Button
          onClick={() => setActiveMode("bleeding")}
          className="h-24 flex-col gap-2 bg-rose-600 hover:bg-rose-700 text-white"
        >
          <span className="text-3xl">🩹</span>
          <span className="font-semibold">Severe Bleeding</span>
        </Button>

        <Button
          onClick={() => setActiveMode("breathing")}
          className="h-24 flex-col gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <span className="text-3xl">🌬️</span>
          <span className="font-semibold">Breathing Issues</span>
        </Button>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-4">
        <p className="text-xs text-yellow-700 dark:text-yellow-500 font-semibold">
          WARNING: These tools provide guidance only. Always call emergency services immediately.
        </p>
      </div>
    </div>
  )

  const renderCPR = () => (
    <div className="space-y-4">
      <Button variant="outline" onClick={() => setActiveMode("menu")} className="mb-2">
        ← Back to Menu
      </Button>

      <div className="text-center">
        <div className="relative inline-block">
          <div
            className={`w-48 h-48 rounded-full flex items-center justify-center text-6xl font-bold transition-all ${
              cprActive ? "bg-red-500 scale-110 animate-pulse" : "bg-red-600"
            } text-white shadow-2xl`}
          >
            {cprCount}
          </div>
          {cprActive && <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping" />}
        </div>

        <div className="mt-6 space-y-3">
          <Badge className="text-lg px-4 py-2 bg-blue-600 text-white">
            Cycle: {Math.floor(cprCount / 30) + 1} | Breaths Given: {breathCount * 2}
          </Badge>

          {!cprActive && cprCount === 0 && (
            <div className="bg-muted rounded-lg p-4 text-left space-y-2">
              <h4 className="font-semibold text-foreground">Before Starting:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Ensure scene is safe</li>
                <li>Check for responsiveness</li>
                <li>Call emergency services (108/102)</li>
                <li>Position patient on firm, flat surface</li>
                <li>Place hands center of chest</li>
              </ul>
            </div>
          )}

          {cprCount > 0 && cprCount % 30 === 0 && !cprActive && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-blue-600 mb-2">Give 2 Rescue Breaths</h4>
              <ul className="text-sm text-muted-foreground space-y-1 text-left list-disc list-inside">
                <li>Tilt head back, lift chin</li>
                <li>Pinch nose shut</li>
                <li>Give 2 breaths (1 second each)</li>
                <li>Watch chest rise</li>
              </ul>
              <Button onClick={continueCPR} className="w-full mt-3 bg-red-600 hover:bg-red-700">
                Continue Compressions
              </Button>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {!cprActive && cprCount === 0 && (
            <Button onClick={startCPR} className="col-span-2 h-14 bg-red-600 hover:bg-red-700 text-white font-semibold">
              Start CPR
            </Button>
          )}
          {cprActive && (
            <Button onClick={() => setCprActive(false)} variant="outline" className="h-12">
              Pause
            </Button>
          )}
          <Button onClick={resetCPR} variant="destructive" className="h-12">
            Reset
          </Button>
        </div>

        <div className="mt-4 bg-muted rounded-lg p-3 text-left">
          <p className="text-xs text-muted-foreground">
            <strong>Rate:</strong> 100-120 compressions/min
            <br />
            <strong>Depth:</strong> 2 inches (5cm)
            <br />
            <strong>Ratio:</strong> 30 compressions : 2 breaths
          </p>
        </div>
      </div>
    </div>
  )

  const renderHeartAttack = () => (
    <div className="space-y-4">
      <Button variant="outline" onClick={() => setActiveMode("menu")} className="mb-2">
        ← Back to Menu
      </Button>

      <div className="space-y-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <h4 className="font-semibold text-red-600 mb-2">Heart Attack Signs:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Chest pain or discomfort</li>
            <li>Pain in arms, back, neck, jaw</li>
            <li>Shortness of breath</li>
            <li>Cold sweat, nausea</li>
            <li>Lightheadedness</li>
          </ul>
        </div>

        <Card className="p-4 border-2 border-primary">
          <h4 className="font-semibold text-foreground mb-3">Immediate Actions:</h4>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-semibold text-foreground">Call Emergency Services</p>
                <p className="text-sm text-muted-foreground">Dial 108 or 102 immediately</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-semibold text-foreground">Help Patient Sit</p>
                <p className="text-sm text-muted-foreground">Have them sit and rest, lean forward if comfortable</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-semibold text-foreground">Aspirin if Available</p>
                <p className="text-sm text-muted-foreground">Have them chew 300mg aspirin (if not allergic)</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <p className="font-semibold text-foreground">Loosen Tight Clothing</p>
                <p className="text-sm text-muted-foreground">Help them breathe easier</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                5
              </div>
              <div>
                <p className="font-semibold text-foreground">Monitor and Reassure</p>
                <p className="text-sm text-muted-foreground">Stay with them, keep them calm</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <p className="text-xs text-yellow-700 dark:text-yellow-500">
            <strong>Do NOT:</strong> Leave them alone, let them deny symptoms, give them anything by mouth except
            aspirin
          </p>
        </div>
      </div>
    </div>
  )

  const renderChoking = () => (
    <div className="space-y-4">
      <Button variant="outline" onClick={() => setActiveMode("menu")} className="mb-2">
        ← Back to Menu
      </Button>

      <Card className="p-4 border-2 border-purple-500">
        <h4 className="font-semibold text-foreground mb-3">Heimlich Maneuver (Abdominal Thrusts):</h4>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-semibold text-foreground">Stand Behind Person</p>
              <p className="text-sm text-muted-foreground">Wrap arms around their waist</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-semibold text-foreground">Position Fist</p>
              <p className="text-sm text-muted-foreground">Make a fist, place above navel below ribcage</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-semibold text-foreground">Grasp Fist</p>
              <p className="text-sm text-muted-foreground">With other hand, grasp your fist firmly</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
              4
            </div>
            <div>
              <p className="font-semibold text-foreground">Quick Upward Thrusts</p>
              <p className="text-sm text-muted-foreground">Press hard, quick inward and upward movements</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
              5
            </div>
            <div>
              <p className="font-semibold text-foreground">Repeat</p>
              <p className="text-sm text-muted-foreground">Continue until object is expelled</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <h4 className="font-semibold text-blue-600 mb-2">If Person Becomes Unconscious:</h4>
        <p className="text-sm text-muted-foreground">
          Lower them to ground, call emergency services, begin CPR starting with chest compressions
        </p>
      </div>
    </div>
  )

  const renderBleeding = () => (
    <div className="space-y-4">
      <Button variant="outline" onClick={() => setActiveMode("menu")} className="mb-2">
        ← Back to Menu
      </Button>

      <Card className="p-4 border-2 border-rose-500">
        <h4 className="font-semibold text-foreground mb-3">Control Severe Bleeding:</h4>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-semibold text-foreground">Protect Yourself</p>
              <p className="text-sm text-muted-foreground">Wear gloves if available</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-semibold text-foreground">Apply Direct Pressure</p>
              <p className="text-sm text-muted-foreground">Use clean cloth, press firmly on wound</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-semibold text-foreground">Maintain Pressure</p>
              <p className="text-sm text-muted-foreground">Hold for at least 10 minutes without checking</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold flex-shrink-0">
              4
            </div>
            <div>
              <p className="font-semibold text-foreground">Add More Cloth</p>
              <p className="text-sm text-muted-foreground">
                If blood soaks through, add more cloth on top (do not remove)
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold flex-shrink-0">
              5
            </div>
            <div>
              <p className="font-semibold text-foreground">Elevate if Possible</p>
              <p className="text-sm text-muted-foreground">Raise injured area above heart level</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
        <p className="text-xs text-red-700 dark:text-red-500">
          <strong>Severe bleeding emergency:</strong> Call 108/102 immediately. Do not remove deeply embedded objects.
        </p>
      </div>
    </div>
  )

  const renderBreathing = () => (
    <div className="space-y-4">
      <Button variant="outline" onClick={() => setActiveMode("menu")} className="mb-2">
        ← Back to Menu
      </Button>

      <Card className="p-4 border-2 border-blue-500">
        <h4 className="font-semibold text-foreground mb-3">Help with Breathing Difficulty:</h4>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-semibold text-foreground">Call Emergency Services</p>
              <p className="text-sm text-muted-foreground">Dial 108 or 102 immediately</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-semibold text-foreground">Position Patient</p>
              <p className="text-sm text-muted-foreground">Help them sit upright or lean slightly forward</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-semibold text-foreground">Loosen Clothing</p>
              <p className="text-sm text-muted-foreground">Remove tight clothing around neck and chest</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
              4
            </div>
            <div>
              <p className="font-semibold text-foreground">Check for Medication</p>
              <p className="text-sm text-muted-foreground">If they have inhaler (asthma), help them use it</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
              5
            </div>
            <div>
              <p className="font-semibold text-foreground">Stay Calm and Reassure</p>
              <p className="text-sm text-muted-foreground">Encourage slow, deep breaths. Keep them calm</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p className="text-xs text-blue-700 dark:text-blue-500">
          <strong>Signs needing immediate help:</strong> Blue lips/face, inability to speak, severe wheezing,
          unconsciousness
        </p>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <span className="text-3xl">🚨</span>
            {activeMode === "menu" && "Emergency Panic Tools"}
            {activeMode === "cpr" && "CPR Pacer"}
            {activeMode === "heart" && "Heart Attack"}
            {activeMode === "choking" && "Choking"}
            {activeMode === "bleeding" && "Severe Bleeding"}
            {activeMode === "breathing" && "Breathing Difficulty"}
          </DialogTitle>
        </DialogHeader>

        {activeMode === "menu" && renderMenu()}
        {activeMode === "cpr" && renderCPR()}
        {activeMode === "heart" && renderHeartAttack()}
        {activeMode === "choking" && renderChoking()}
        {activeMode === "bleeding" && renderBleeding()}
        {activeMode === "breathing" && renderBreathing()}
      </DialogContent>
    </Dialog>
  )
}
