"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mic, MicOff, Volume2, AlertCircle } from "lucide-react"
import { getCurrentLanguage } from "@/lib/translations"

interface VoiceCommandProps {
  onCommand: (command: VoiceCommandResult) => void
  isActive: boolean
  onToggle: () => void
}

export interface VoiceCommandResult {
  field: string
  value: string
  confidence: number
}

export default function VoiceCommand({ onCommand, isActive, onToggle }: VoiceCommandProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [status, setStatus] = useState("Ready")
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const recognitionRef = useRef<any>(null)
  const isStartingRef = useRef(false)
  const restartTimeoutRef = useRef<NodeJS.Timeout>()
  const [lang] = useState(getCurrentLanguage())

  useEffect(() => {
    if (typeof window === "undefined") return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setStatus("Speech recognition not supported")
      setErrorMessage("Your browser doesn't support speech recognition. Try Chrome or Edge.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true

    const langMap = {
      en: "en-US",
      hi: "hi-IN",
      kn: "kn-IN",
    }
    recognition.lang = langMap[lang as keyof typeof langMap] || "en-US"

    recognition.onstart = () => {
      isStartingRef.current = false
      setIsListening(true)
      setStatus("Listening...")
      setErrorMessage("")
      speak("I'm listening. Please speak your information.")
    }

    recognition.onend = () => {
      setIsListening(false)
      isStartingRef.current = false

      if (isActive && !isStartingRef.current && hasPermission) {
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current)
        }

        restartTimeoutRef.current = setTimeout(() => {
          if (isActive && !isStartingRef.current) {
            try {
              isStartingRef.current = true
              recognition.start()
            } catch (e) {
              console.error("[v0] Failed to restart recognition:", e)
              isStartingRef.current = false
            }
          }
        }, 500)
      }
    }

    recognition.onresult = (event: any) => {
      let interimTranscript = ""
      let finalTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " "
        } else {
          interimTranscript += transcript
        }
      }

      setTranscript(interimTranscript || finalTranscript)

      if (finalTranscript) {
        processCommand(finalTranscript.trim(), event.results[event.resultIndex][0].confidence)
      }
    }

    recognition.onerror = (event: any) => {
      console.error("[v0] Speech recognition error:", event.error)
      isStartingRef.current = false
      setIsListening(false)

      switch (event.error) {
        case "audio-capture":
          setStatus("Microphone error")
          setErrorMessage("Cannot access microphone. Please check if another app is using it.")
          setHasPermission(false)
          onToggle()
          break
        case "not-allowed":
          setStatus("Permission denied")
          setErrorMessage("Microphone permission denied. Please allow access and try again.")
          setHasPermission(false)
          onToggle()
          break
        case "no-speech":
          setStatus("No speech detected")
          if (isActive) {
            restartTimeoutRef.current = setTimeout(() => {
              if (isActive && !isStartingRef.current) {
                try {
                  isStartingRef.current = true
                  recognition.start()
                } catch (e) {
                  isStartingRef.current = false
                }
              }
            }, 1000)
          }
          break
        case "aborted":
          setStatus("Stopped")
          break
        case "network":
          setStatus("Network error")
          setErrorMessage("Network error. Please check your internet connection.")
          break
        default:
          setStatus(`Error: ${event.error}`)
          if (isActive && !isStartingRef.current) {
            restartTimeoutRef.current = setTimeout(() => {
              if (isActive && !isStartingRef.current) {
                try {
                  isStartingRef.current = true
                  recognition.start()
                } catch (e) {
                  isStartingRef.current = false
                }
              }
            }, 1000)
          }
      }
    }

    recognitionRef.current = recognition

    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current)
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {}
      }
    }
  }, [lang, isActive, hasPermission, onToggle])

  useEffect(() => {
    const checkMicrophonePermission = async () => {
      try {
        if (typeof navigator !== "undefined" && navigator.mediaDevices) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          stream.getTracks().forEach((track) => track.stop())
          setHasPermission(true)
          setErrorMessage("")
        }
      } catch (error: any) {
        setHasPermission(false)
        if (error.name === "NotAllowedError") {
          setErrorMessage("Microphone permission denied. Please allow microphone access in your browser settings.")
        } else if (error.name === "NotFoundError") {
          setErrorMessage("No microphone found. Please connect a microphone and try again.")
        } else {
          setErrorMessage("Unable to access microphone. Please check your browser settings.")
        }
        console.error("[v0] Microphone permission error:", error)
      }
    }

    if (isActive && hasPermission === null) {
      checkMicrophonePermission()
    }
  }, [isActive, hasPermission])

  useEffect(() => {
    if (!recognitionRef.current || hasPermission === false) return

    if (isActive && !isListening && !isStartingRef.current) {
      try {
        isStartingRef.current = true
        recognitionRef.current.start()
      } catch (e) {
        console.error("Failed to start recognition:", e)
        isStartingRef.current = false
        setErrorMessage("Failed to start voice recognition. Please try again.")
      }
    } else if (!isActive && isListening) {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current)
      }
      isStartingRef.current = false
      recognitionRef.current.stop()
      setStatus("Stopped")
    }
  }, [isActive, isListening, hasPermission])

  const speak = (text: string) => {
    if (typeof window === "undefined") return
    const utterance = new SpeechSynthesisUtterance(text)

    const langMap = {
      en: "en-US",
      hi: "hi-IN",
      kn: "kn-IN",
    }
    utterance.lang = langMap[lang as keyof typeof langMap] || "en-US"
    utterance.rate = 1.0
    utterance.pitch = 1.0

    window.speechSynthesis.speak(utterance)
  }

  const processCommand = (text: string, confidence: number) => {
    const lowerText = text.toLowerCase()

    if (lowerText.includes("my name is") || lowerText.includes("name is") || lowerText.includes("called")) {
      const nameMatch = lowerText.match(/(?:my name is|name is|called)\s+([a-z\s]+?)(?:\s|$|and|my|age|emergency)/i)
      if (nameMatch) {
        const name = nameMatch[1].trim()
        onCommand({ field: "name", value: name, confidence })
        speak(`Name recorded as ${name}`)
      }
    }

    if (lowerText.includes("age") || lowerText.includes("years old") || lowerText.includes("year old")) {
      const ageMatch = lowerText.match(/(?:age|aged|years old|year old)[:\s]+(\d+)/i)
      if (ageMatch) {
        const age = ageMatch[1]
        onCommand({ field: "age", value: age, confidence })
        speak(`Age recorded as ${age}`)
      }
    }

    const phoneMatch = lowerText.match(/\d{10}/)
    if (phoneMatch) {
      const phone = phoneMatch[0]
      onCommand({ field: "phone", value: phone, confidence })
      speak(`Phone number recorded`)
    }

    if (lowerText.includes("male") && !lowerText.includes("female")) {
      onCommand({ field: "gender", value: "male", confidence })
      speak("Gender recorded as male")
    } else if (lowerText.includes("female")) {
      onCommand({ field: "gender", value: "female", confidence })
      speak("Gender recorded as female")
    }

    const bloodMatch = lowerText.match(/blood\s+group\s+(?:is\s+)?([abo][+-])/i)
    if (bloodMatch) {
      const bloodGroup = bloodMatch[1].toUpperCase()
      onCommand({ field: "bloodGroup", value: bloodGroup, confidence })
      speak(`Blood group recorded as ${bloodGroup}`)
    }

    const emergencyTypes = {
      "heart attack": "cardiac",
      cardiac: "cardiac",
      "road accident": "road_accident",
      accident: "road_accident",
      stroke: "stroke",
      breathing: "respiratory",
      "breathing problem": "respiratory",
      pregnancy: "pregnancy",
      trauma: "trauma",
      injury: "trauma",
      burn: "burns",
      poisoning: "poisoning",
      unconscious: "unconscious",
    }

    for (const [keyword, type] of Object.entries(emergencyTypes)) {
      if (lowerText.includes(keyword)) {
        onCommand({ field: "emergencyType", value: type, confidence })
        speak(`Emergency type recorded as ${keyword}`)
        break
      }
    }

    if (lowerText.includes("location") || lowerText.includes("address") || lowerText.includes("place")) {
      const locationMatch = lowerText.match(/(?:location|address|place)[:\s]+(.+?)(?:\s|$)/i)
      if (locationMatch) {
        const location = locationMatch[1].trim()
        onCommand({ field: "location", value: location, confidence })
        speak(`Location recorded`)
      }
    }

    if (lowerText.includes("icu") || lowerText.includes("intensive care")) {
      onCommand({ field: "ambulanceType", value: "icu", confidence })
      speak("ICU ambulance selected")
    } else if (lowerText.includes("basic ambulance") || lowerText.includes("basic")) {
      onCommand({ field: "ambulanceType", value: "basic", confidence })
      speak("Basic ambulance selected")
    } else if (lowerText.includes("critical") || lowerText.includes("critical care")) {
      onCommand({ field: "ambulanceType", value: "critical", confidence })
      speak("Critical care ambulance selected")
    }

    if (lowerText.includes("book ambulance") || lowerText.includes("confirm") || lowerText.includes("book now")) {
      onCommand({ field: "command", value: "book", confidence })
      speak("Booking ambulance now")
    }

    if (lowerText.includes("cancel") || lowerText.includes("stop")) {
      onCommand({ field: "command", value: "cancel", confidence })
      speak("Cancelled")
      onToggle()
    }

    if (lowerText.includes("help") || lowerText.includes("ambulance") || lowerText.includes("emergency")) {
      onCommand({ field: "command", value: "emergency", confidence: 1.0 })
      speak("Emergency detected! Starting booking process.")
    }
  }

  return (
    <Card className={`p-4 border-2 transition-all ${isActive ? "border-green-500 bg-green-500/5" : "border-border"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Voice Command</h3>
        </div>
        <Button
          onClick={onToggle}
          size="sm"
          variant={isActive ? "default" : "outline"}
          className={isActive ? "bg-green-600 hover:bg-green-700" : "bg-transparent"}
          disabled={hasPermission === false}
        >
          {isActive ? (
            <Mic className={`w-4 h-4 mr-2 ${isListening ? "text-red-500 animate-pulse" : "text-gray-400"}`} />
          ) : (
            <MicOff className="w-4 h-4 mr-2" />
          )}
          {isActive ? "Stop" : "Start"}
        </Button>
      </div>

      <div className="space-y-2">
        {errorMessage && (
          <div className="flex items-start gap-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-sm">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
            <span className="text-destructive">{errorMessage}</span>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Status: <span className={isListening ? "text-green-600 font-semibold" : ""}>{status}</span>
        </div>
        {transcript && (
          <div className="p-2 bg-muted rounded text-sm">
            <span className="text-muted-foreground">You said:</span> {transcript}
          </div>
        )}
        <div className="text-xs text-muted-foreground">
          Try saying: "My name is John", "Age 35", "Road accident", "Book ambulance"
        </div>
      </div>
    </Card>
  )
}
