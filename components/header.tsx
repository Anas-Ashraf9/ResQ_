"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import ThemeToggle from "@/components/theme-toggle"
import PanicTools from "@/components/panic-tools"
import LanguageSelector from "@/components/language-selector"
import { getCurrentLanguage, getTranslation } from "@/lib/translations"

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [panicToolsOpen, setPanicToolsOpen] = useState(false)
  const [lang, setLang] = useState(getCurrentLanguage())
  const router = useRouter()

  const t = (key: string) => getTranslation(lang, key)

  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }

    const handleLanguageChange = () => {
      setLang(getCurrentLanguage())
    }

    window.addEventListener("languagechange", handleLanguageChange)
    return () => window.removeEventListener("languagechange", handleLanguageChange)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("isLoggedIn")
    router.push("/")
  }

  return (
    <>
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg">
              R
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {t("appName")}
              </span>
              <p className="text-xs text-muted-foreground -mt-1">{t("appTagline")}</p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">
              {t("home")}
            </Link>
            <Link href="/book" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">
              {t("bookAmbulance")}
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition"
            >
              {t("profile")}
            </Link>
            <div className="h-4 w-px bg-border" />
            <Link href="/driver" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition">
              {t("driverPanel")}
            </Link>
            <Link href="/admin" className="text-sm font-medium text-green-600 hover:text-green-700 transition">
              {t("hospitalAdmin")}
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSelector />

            <Button
              onClick={() => setPanicToolsOpen(true)}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold animate-pulse"
            >
              🚨 {t("sos")}
            </Button>

            <ThemeToggle />

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-md hover:bg-muted transition"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {user ? (
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="text-xs hidden sm:flex bg-transparent"
              >
                {t("logout")}
              </Button>
            ) : (
              <Link href="/login" className="hidden sm:block">
                <Button className="bg-primary hover:bg-primary/90 text-xs sm:text-sm">{t("login")}</Button>
              </Link>
            )}
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden border-t border-border bg-card">
            <nav className="flex flex-col p-4 gap-2">
              <Link
                href="/"
                className="px-3 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-md transition"
              >
                {t("home")}
              </Link>
              <Link
                href="/book"
                className="px-3 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-md transition"
              >
                {t("bookAmbulance")}
              </Link>
              <Link
                href="/dashboard"
                className="px-3 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-md transition"
              >
                {t("profile")}
              </Link>
              <div className="h-px bg-border my-2" />
              <Link
                href="/driver"
                className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-md transition"
              >
                {t("driverPanel")}
              </Link>
              <Link
                href="/admin"
                className="px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50 dark:hover:bg-green-950 rounded-md transition"
              >
                {t("hospitalAdmin")}
              </Link>
              {user ? (
                <Button onClick={handleLogout} variant="outline" size="sm" className="mt-2 bg-transparent">
                  {t("logout")}
                </Button>
              ) : (
                <Link href="/login">
                  <Button className="w-full bg-primary hover:bg-primary/90 mt-2">{t("login")}</Button>
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      <PanicTools open={panicToolsOpen} onClose={() => setPanicToolsOpen(false)} />
    </>
  )
}
