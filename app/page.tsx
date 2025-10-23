"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Search, Bell, Wallet, Home } from "lucide-react"
import { TokenSearch } from "@/components/token-search"
import { WatchlistView } from "@/components/watchlist-view"
import { AlertsView } from "@/components/alerts-view"
import { cn } from "@/lib/utils"

// Mock Farcaster auth - in real implementation, use @farcaster/auth-kit
interface User {
  fid: number
  username: string
  displayName: string
  pfpUrl: string
}

type TabType = "tokens" | "search" | "alerts"

export default function TokenTracker() {
  useEffect(() => {
    // Ensure Farcaster Mini App SDK ready is called when running inside the runtime
    ;(async () => {
      try {
        const { ensureSdkReady } = await import("@/lib/farcaster-sdk")
        const ok = await ensureSdkReady()
        if (!ok) {
          // Non-fatal: this app also works in standalone browser for development
          console.info("Farcaster SDK not present or failed to initialize; continuing in dev mode.")
        }
      } catch (err) {
        console.error("Failed to initialize Farcaster SDK helper:", err)
      }
    })()
  }, [])

  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>("tokens")

  // Real Farcaster-aware authentication flow (falls back to mock for dev)
  const handleFarcasterLogin = async () => {
    setIsLoading(true)
    try {
      const sdk = await import("@/lib/farcaster-sdk")
      // Try to request auth via runtime if available
      const authRequested = await sdk.requestAuth()
      // Then try to read user from runtime
      const u = await sdk.getFarcasterUser()
      if (u) {
        setUser(u)
        setIsLoading(false)
        return
      }

      // Fallback: if runtime didn't return user, wait briefly and try again
      await new Promise((resolve) => setTimeout(resolve, 800))
      const u2 = await sdk.getFarcasterUser()
      if (u2) {
        setUser(u2)
        setIsLoading(false)
        return
      }

      // Development fallback — populate a local mock user
      setUser({
        fid: 12345,
        username: "dev_cryptotrader",
        displayName: "Dev Crypto",
        pfpUrl: "/diverse-user-avatars.png",
      })
    } catch (err) {
      console.error("Farcaster login failed:", err)
      // dev fallback
      setUser({
        fid: 12345,
        username: "dev_cryptotrader",
        displayName: "Dev Crypto",
        pfpUrl: "/diverse-user-avatars.png",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8 sm:py-16 max-w-sm sm:max-w-md">
          <div className="animate-in fade-in duration-700">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-2xl mb-3 sm:mb-4 animate-in zoom-in duration-500 delay-200">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-balance mb-2 animate-in slide-in-from-bottom duration-500 delay-300">
                Token Tracker
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground text-pretty animate-in slide-in-from-bottom duration-500 delay-400">
                Track your favorite tokens and set price alerts on Farcaster
              </p>
            </div>

            <Card className="animate-in slide-in-from-bottom duration-500 delay-500">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-lg sm:text-xl">Welcome to Token Tracker</CardTitle>
                <CardDescription className="text-sm">
                  Connect with Farcaster to start tracking tokens and managing alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleFarcasterLogin}
                  disabled={isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 transition-all duration-200 hover:scale-105"
                  size="lg"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Connecting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      Connect with Farcaster
                    </div>
                  )}
                </Button>

                <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-4">
                  <div className="text-center animate-in fade-in duration-500 delay-700">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-2 transition-all duration-200 hover:scale-110">
                      <Search className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Search Tokens</p>
                  </div>
                  <div className="text-center animate-in fade-in duration-500 delay-800">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-2 transition-all duration-200 hover:scale-110">
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Track Prices</p>
                  </div>
                  <div className="text-center animate-in fade-in duration-500 delay-900">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mx-auto mb-2 transition-all duration-200 hover:scale-110">
                      <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Get Alerts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "tokens":
        return <WatchlistView onNavigateToSearch={() => setActiveTab("search")} />
      case "search":
        return <TokenSearch />
      case "alerts":
        return <AlertsView onNavigateToSearch={() => setActiveTab("search")} />
      default:
        return <WatchlistView onNavigateToSearch={() => setActiveTab("search")} />
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-24">
      {/* Header */}
      <header className="border-b bg-card animate-in slide-in-from-top duration-500 sticky top-0 z-40">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold">Token Tracker</h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Badge variant="secondary" className="hidden sm:flex text-xs">
                FID: {user.fid}
              </Badge>
              <div className="flex items-center gap-2">
                <img
                  src={user.pfpUrl || "/placeholder.svg"}
                  alt={user.displayName}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-all duration-200 hover:scale-110"
                />
                <span className="font-medium hidden sm:block text-sm">{user.displayName}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="transition-all duration-200 hover:scale-105 text-xs sm:text-sm px-2 sm:px-3"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 animate-in fade-in duration-700 delay-200">
        {renderTabContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t z-50 safe-area-inset-bottom">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-around py-2 sm:py-3">
            <button
              onClick={() => setActiveTab("tokens")}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-3 sm:px-4 rounded-lg transition-all duration-200 min-w-0",
                activeTab === "tokens"
                  ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <Home className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs font-medium">Tokens</span>
            </button>

            <button
              onClick={() => setActiveTab("search")}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-3 sm:px-4 rounded-lg transition-all duration-200 min-w-0",
                activeTab === "search"
                  ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <Search className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs font-medium">Search</span>
            </button>

            <button
              onClick={() => setActiveTab("alerts")}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-3 sm:px-4 rounded-lg transition-all duration-200 min-w-0",
                activeTab === "alerts"
                  ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <Bell className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs font-medium">Alerts</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  )
}
