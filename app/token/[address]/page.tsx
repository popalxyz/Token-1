"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, TrendingUp, TrendingDown, Plus, Bell, ExternalLink, Check, Copy } from "lucide-react"
import { useWatchlistStore } from "@/lib/watchlist-store"
import { CreateAlertDialog } from "@/components/create-alert-dialog"
import type { TokenPair } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function TokenDetailPage() {
  const params = useParams()
  const router = useRouter()
  const address = params.address as string

  const [tokenData, setTokenData] = useState<TokenPair | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const { addToWatchlist, isInWatchlist } = useWatchlistStore()

  useEffect(() => {
    const fetchTokenData = async () => {
      if (!address) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`)

        if (!response.ok) {
          throw new Error("Failed to fetch token data")
        }

        const data = await response.json()

        if (data.pairs && data.pairs.length > 0) {
          // Get the pair with highest volume
          const bestPair = data.pairs.sort((a: any, b: any) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))[0]
          setTokenData(bestPair)
        } else {
          throw new Error("Token not found")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load token data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTokenData()
    // Refresh every 30 seconds
    const interval = setInterval(fetchTokenData, 30000)
    return () => clearInterval(interval)
  }, [address])

  const handleCopyAddress = async () => {
    if (!address) return

    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy address:", err)
    }
  }

  const handleAddToWatchlist = () => {
    if (!tokenData) return
    addToWatchlist(tokenData.baseToken)
  }

  const formatPrice = (price: string | undefined) => {
    if (!price) return "N/A"
    const num = Number.parseFloat(price)
    if (num < 0.01) return `$${num.toExponential(2)}`
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`
  }

  const formatVolume = (volume: number | undefined) => {
    if (!volume) return "N/A"
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`
    if (volume >= 1000) return `$${(volume / 1000).toFixed(1)}K`
    return `$${volume.toFixed(0)}`
  }

  const formatPercentage = (change: number | undefined) => {
    if (change === undefined || change === null) return "N/A"
    const sign = change >= 0 ? "+" : ""
    return `${sign}${change.toFixed(2)}%`
  }

  const formatMarketCap = (marketCap: number | undefined) => {
    if (!marketCap) return "N/A"
    if (marketCap >= 1000000000) return `$${(marketCap / 1000000000).toFixed(2)}B`
    if (marketCap >= 1000000) return `$${(marketCap / 1000000).toFixed(2)}M`
    if (marketCap >= 1000) return `$${(marketCap / 1000).toFixed(2)}K`
    return `$${marketCap.toFixed(0)}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-16">
            <div className="text-center animate-in fade-in duration-500">
              <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground animate-pulse">Loading token data...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !tokenData) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <div className="text-center py-16 animate-in slide-in-from-bottom duration-500">
            <h2 className="text-xl font-semibold mb-2">Token Not Found</h2>
            <p className="text-muted-foreground mb-6">{error || "Unable to load token data"}</p>
            <Button onClick={() => router.back()} className="transition-all duration-200 hover:scale-105">
              Go Back
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const inWatchlist = isInWatchlist(tokenData.baseToken.address)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card animate-in slide-in-from-top duration-500">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="transition-all duration-200 hover:scale-105"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold transition-all duration-200 hover:scale-110">
                  {tokenData.baseToken.symbol?.charAt(0) || "?"}
                </div>
                <div>
                  <h1 className="text-xl font-bold">{tokenData.baseToken.name || tokenData.baseToken.symbol}</h1>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{tokenData.baseToken.symbol}</Badge>
                    <Badge variant="outline">{tokenData.chainId}</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={inWatchlist ? "default" : "outline"}
                onClick={handleAddToWatchlist}
                disabled={inWatchlist}
                className="transition-all duration-200 hover:scale-105"
              >
                {inWatchlist ? <Check className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                {inWatchlist ? "In Watchlist" : "Add"}
              </Button>

              <CreateAlertDialog
                token={tokenData.baseToken}
                trigger={
                  <Button size="sm" className="transition-all duration-200 hover:scale-105">
                    <Bell className="w-4 h-4 mr-2" />
                    Create Alert
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6 animate-in fade-in duration-700 delay-200">
          {/* Price Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="animate-in slide-in-from-bottom duration-500 delay-300 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Price</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(tokenData.priceUsd)}</div>
              </CardContent>
            </Card>

            <Card className="animate-in slide-in-from-bottom duration-500 delay-400 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">24h Change</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {(tokenData.priceChange?.h24 || 0) >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span
                    className={cn(
                      "text-xl font-bold",
                      (tokenData.priceChange?.h24 || 0) >= 0 ? "text-green-500" : "text-red-500",
                    )}
                  >
                    {formatPercentage(tokenData.priceChange?.h24)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-in slide-in-from-bottom duration-500 delay-500 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">24h Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatVolume(tokenData.volume?.h24)}</div>
              </CardContent>
            </Card>

            <Card className="animate-in slide-in-from-bottom duration-500 delay-600 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Market Cap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatMarketCap(tokenData.marketCap)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Information */}
          <Tabs defaultValue="overview" className="w-full animate-in slide-in-from-bottom duration-500 delay-700">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="transition-all duration-200">
                Overview
              </TabsTrigger>
              <TabsTrigger value="trading" className="transition-all duration-200">
                Trading
              </TabsTrigger>
              <TabsTrigger value="info" className="transition-all duration-200">
                Token Info
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Price Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">5m Change</p>
                        <p
                          className={cn(
                            "font-medium",
                            (tokenData.priceChange?.m5 || 0) >= 0 ? "text-green-500" : "text-red-500",
                          )}
                        >
                          {formatPercentage(tokenData.priceChange?.m5)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">1h Change</p>
                        <p
                          className={cn(
                            "font-medium",
                            (tokenData.priceChange?.h1 || 0) >= 0 ? "text-green-500" : "text-red-500",
                          )}
                        >
                          {formatPercentage(tokenData.priceChange?.h1)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">6h Change</p>
                        <p
                          className={cn(
                            "font-medium",
                            (tokenData.priceChange?.h6 || 0) >= 0 ? "text-green-500" : "text-red-500",
                          )}
                        >
                          {formatPercentage(tokenData.priceChange?.h6)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">24h Change</p>
                        <p
                          className={cn(
                            "font-medium",
                            (tokenData.priceChange?.h24 || 0) >= 0 ? "text-green-500" : "text-red-500",
                          )}
                        >
                          {formatPercentage(tokenData.priceChange?.h24)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Liquidity & Market</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Liquidity (USD)</span>
                        <span className="font-medium">{formatVolume(tokenData.liquidity?.usd)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">FDV</span>
                        <span className="font-medium">{formatMarketCap(tokenData.fdv)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Market Cap</span>
                        <span className="font-medium">{formatMarketCap(tokenData.marketCap)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trading" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Volume Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">5m Volume</p>
                        <p className="font-medium">{formatVolume(tokenData.volume?.m5)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">1h Volume</p>
                        <p className="font-medium">{formatVolume(tokenData.volume?.h1)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">6h Volume</p>
                        <p className="font-medium">{formatVolume(tokenData.volume?.h6)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">24h Volume</p>
                        <p className="font-medium">{formatVolume(tokenData.volume?.h24)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Transaction Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">24h Buys</span>
                        <span className="font-medium text-green-500">{tokenData.txns?.h24?.buys || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">24h Sells</span>
                        <span className="font-medium text-red-500">{tokenData.txns?.h24?.sells || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">1h Buys</span>
                        <span className="font-medium text-green-500">{tokenData.txns?.h1?.buys || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">1h Sells</span>
                        <span className="font-medium text-red-500">{tokenData.txns?.h1?.sells || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Token Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Contract Address</p>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                          {tokenData.baseToken.address}
                        </code>
                        <Button size="sm" variant="ghost" onClick={handleCopyAddress} className="h-8 w-8 p-0">
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Pair Address</p>
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono">{tokenData.pairAddress}</code>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">DEX</p>
                      <Badge variant="outline">{tokenData.dexId}</Badge>
                    </div>

                    {tokenData.pairCreatedAt && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Pair Created</p>
                        <p className="font-medium">{new Date(tokenData.pairCreatedAt * 1000).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={() => {
                        const { openExternal } = require('@/lib/browser')
                        openExternal(tokenData.url)
                      }}
                      className="w-full"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on {tokenData.dexId}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
