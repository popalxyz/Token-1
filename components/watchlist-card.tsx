"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TrendingUp, TrendingDown, Trash2, Edit3, ExternalLink, Bell } from "lucide-react"
import type { WatchlistItem } from "@/lib/types"
import { useWatchlistStore } from "@/lib/watchlist-store"
import { CreateAlertDialog } from "@/components/create-alert-dialog"
import { cn } from "@/lib/utils"

interface WatchlistCardProps {
  item: WatchlistItem
}

export function WatchlistCard({ item }: WatchlistCardProps) {
  const { removeFromWatchlist, updateWatchlistItem } = useWatchlistStore()
  const [priceData, setPriceData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notes, setNotes] = useState(item.notes || "")

  // Fetch current price data
  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        console.log("[v0] Fetching price for token:", item.token.address)

        // Try multiple endpoints and chains for better data coverage
        let response: Response
        let data: any
        const chains = ["ethereum", "base", "polygon", "arbitrum", "optimism"]

        // First try the tokens endpoint across multiple chains
        for (const chain of chains) {
          try {
            response = await fetch(`https://api.dexscreener.com/tokens/v1/${chain}/${item.token.address}`)
            if (response.ok) {
              const chainData = await response.json()
              console.log(`[v0] ${chain} endpoint response:`, chainData)
              if (Array.isArray(chainData) && chainData.length > 0) {
                data = chainData
                break
              }
            }
          } catch (err) {
            console.log(`[v0] ${chain} endpoint failed:`, err)
            continue
          }
        }

        // If tokens endpoint fails, try search endpoint
        if (!data || !Array.isArray(data) || data.length === 0) {
          try {
            response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${item.token.address}`)
            if (response.ok) {
              const searchData = await response.json()
              console.log("[v0] Search endpoint response:", searchData)
              if (searchData.pairs && searchData.pairs.length > 0) {
                data = searchData.pairs
              }
            }
          } catch (err) {
            console.log("[v0] Search endpoint also failed:", err)
          }
        }

        if (data && Array.isArray(data) && data.length > 0) {
          const bestPair = data
            .filter((pair: any) => {
              const hasValidPrice =
                pair.priceUsd && !isNaN(Number.parseFloat(pair.priceUsd)) && Number.parseFloat(pair.priceUsd) >= 0
              const hasValidVolume = pair.volume && pair.volume.h24 !== undefined
              return hasValidPrice || hasValidVolume
            })
            .sort((a: any, b: any) => {
              // Sort by liquidity first, then volume
              const aLiquidity = a.liquidity?.usd || 0
              const bLiquidity = b.liquidity?.usd || 0
              if (bLiquidity !== aLiquidity) return bLiquidity - aLiquidity

              const aVolume = a.volume?.h24 || 0
              const bVolume = b.volume?.h24 || 0
              return bVolume - aVolume
            })[0]

          console.log("[v0] Selected best pair:", bestPair)
          setPriceData(bestPair)
        } else {
          console.log("[v0] No valid price data found")
          setPriceData(null)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch price data:", error)
        setPriceData(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPriceData()
    const interval = setInterval(fetchPriceData, 60000)
    return () => clearInterval(interval)
  }, [item.token.address])

  const handleSaveNotes = () => {
    updateWatchlistItem(item.id, { notes })
  }

  const formatPrice = (price: string | undefined) => {
    if (!price) return "N/A"
    const num = Number.parseFloat(price)
    if (Number.isNaN(num)) return "N/A"
    if (num === 0) return "$0.00"
    if (num < 0.0000001) return `$${num.toExponential(2)}`
    if (num < 0.000001) return `$${num.toFixed(9)}`
    if (num < 0.01) return `$${num.toFixed(8)}`
    if (num < 1) return `$${num.toFixed(6)}`
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`
  }

  const formatPercentage = (change: number | undefined) => {
    if (change === undefined || change === null || Number.isNaN(change)) return "N/A"
    const sign = change >= 0 ? "+" : ""
    return `${sign}${change.toFixed(2)}%`
  }

  const formatVolume = (volume: number | undefined) => {
    if (!volume || Number.isNaN(volume)) return "N/A"
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`
    if (volume >= 1000) return `$${(volume / 1000).toFixed(1)}K`
    return `$${volume.toFixed(0)}`
  }

  return (
    <Card className="hover:shadow-md transition-all duration-300 hover:scale-[1.02] animate-in fade-in duration-500 group">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between mb-3 gap-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all duration-200 group-hover:scale-110 flex-shrink-0">
              {item.token.symbol?.charAt(0) || "?"}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 sm:gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold text-sm sm:text-base truncate">{item.token.name || item.token.symbol}</h3>
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  {item.token.symbol}
                </Badge>
                <Badge variant="outline" className="text-xs flex-shrink-0 font-mono">
                  ID: {item.token.address.slice(0, 6)}...{item.token.address.slice(-4)}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground">Added {item.addedAt.toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <CreateAlertDialog
              token={item.token}
              trigger={
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0 transition-all duration-200 hover:scale-110"
                >
                  <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              }
            />

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0 transition-all duration-200 hover:scale-110"
                >
                  <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="animate-in fade-in zoom-in duration-300 mx-4 sm:mx-0 max-w-sm sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-base sm:text-lg">Edit Notes - {item.token.symbol}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Add notes about this token..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="transition-all duration-200 focus:scale-[1.02] text-sm resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setNotes(item.notes || "")}
                      className="transition-all duration-200 hover:scale-105 text-sm"
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveNotes}
                      className="transition-all duration-200 hover:scale-105 text-sm"
                      size="sm"
                    >
                      Save Notes
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => removeFromWatchlist(item.token.address)}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0 text-destructive hover:text-destructive transition-all duration-200 hover:scale-110"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        ) : priceData ? (
          <div className="space-y-3 animate-in slide-in-from-bottom duration-300 delay-200">
            <div className="flex items-center justify-between">
              <span className="text-base sm:text-lg font-bold">{formatPrice(priceData.priceUsd)}</span>

              {priceData.priceChange?.h24 !== undefined && (
                <div className="flex items-center gap-1">
                  {(priceData.priceChange?.h24 || 0) >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span
                    className={cn(
                      "text-sm font-medium",
                      (priceData.priceChange?.h24 || 0) >= 0 ? "text-green-500" : "text-red-500",
                    )}
                  >
                    {formatPercentage(priceData.priceChange?.h24)}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
              {priceData.volume?.h24 && (
                <div>
                  <p className="text-muted-foreground text-xs sm:text-sm">24h Volume</p>
                  <p className="font-medium text-sm">{formatVolume(priceData.volume?.h24)}</p>
                </div>
              )}
              {priceData.liquidity?.usd && (
                <div>
                  <p className="text-muted-foreground text-xs sm:text-sm">Liquidity</p>
                  <p className="font-medium text-sm">{formatVolume(priceData.liquidity?.usd)}</p>
                </div>
              )}
            </div>

            {priceData.url && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const { openExternal } = require('@/lib/browser')
                  openExternal(priceData.url)
                }}
                className="w-full transition-all duration-200 hover:scale-105 text-sm"
              >
                <ExternalLink className="w-3 h-3 mr-2" />
                View on DEX
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground text-sm animate-in fade-in duration-300">
            Price data unavailable
          </div>
        )}

        {item.notes && (
          <div className="mt-3 p-3 bg-muted rounded-lg animate-in fade-in duration-300 delay-300">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Notes:</p>
            <p className="text-sm break-words">{item.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
