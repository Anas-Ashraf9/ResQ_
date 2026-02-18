"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getCurrentLanguage, setCurrentLanguage, type Language } from "@/lib/translations"

export default function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState<Language>("en")

  useEffect(() => {
    setCurrentLang(getCurrentLanguage())

    const handleLanguageChange = () => {
      setCurrentLang(getCurrentLanguage())
      applyTranslations()
    }

    window.addEventListener("languagechange", handleLanguageChange)
    return () => window.removeEventListener("languagechange", handleLanguageChange)
  }, [])

  const changeLang = (lang: Language) => {
    setCurrentLanguage(lang)
    setCurrentLang(lang)
    applyTranslations()
  }

  const applyTranslations = () => {
    const elements = document.querySelectorAll("[data-i18n]")
    const lang = getCurrentLanguage()

    elements.forEach((el) => {
      const key = el.getAttribute("data-i18n")
      if (key) {
        const translation = getTranslation(lang, key)
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          ;(el as HTMLInputElement).placeholder = translation
        } else {
          el.textContent = translation
        }
      }
    })
  }

  const languages = {
    en: { name: "English", flag: "🇬🇧" },
    hi: { name: "हिन्दी", flag: "🇮🇳" },
    kn: { name: "ಕನ್ನಡ", flag: "🇮🇳" },
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <span>{languages[currentLang].flag}</span>
          <span className="hidden sm:inline">{languages[currentLang].name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(languages).map(([code, { name, flag }]) => (
          <DropdownMenuItem key={code} onClick={() => changeLang(code as Language)} className="gap-2 cursor-pointer">
            <span>{flag}</span>
            <span>{name}</span>
            {currentLang === code && <span className="ml-auto text-primary">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Helper function for translations
function getTranslation(lang: Language, key: string): string {
  const translations: Record<Language, Record<string, string>> = {
    en: {
      patientName: "Patient Name",
      age: "Age",
      phone: "Phone Number",
      bookNow: "Book Now",
      emergency: "Emergency",
      // Add more as needed
    },
    hi: {
      patientName: "रोगी का नाम",
      age: "आयु",
      phone: "फोन नंबर",
      bookNow: "अभी बुक करें",
      emergency: "आपातकाल",
    },
    kn: {
      patientName: "ರೋಗಿಯ ಹೆಸರು",
      age: "ವಯಸ್ಸು",
      phone: "ಫೋನ್ ಸಂಖ್ಯೆ",
      bookNow: "ಈಗ ಬುಕ್ ಮಾಡಿ",
      emergency: "ತುರ್ತು",
    },
  }
  return translations[lang]?.[key] || key
}
