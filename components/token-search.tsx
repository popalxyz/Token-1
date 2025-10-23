"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, TrendingUp, TrendingDown, Plus, ExternalLink, Check } from "lucide-react"
import type { Token, TokenPair } from "@/lib/types"
import { useWatchlistStore } from "@/lib/watchlist-store"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface TokenSearchProps {
  onAddToWatchlist?: (token: Token) => void
  onSelectToken?: (token: Token) => void
}

export function TokenSearch({ onAddToWatchlist, onSelectToken }: TokenSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<TokenPair[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { addToWatchlist, isInWatchlist } = useWatchlistStore()

  const searchTokens = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Searching for:", searchQuery)
      let response: Response
      let data: any

      // Check if query looks like a contract address (starts with 0x and is 42 characters)
      if (searchQuery.startsWith("0x") && searchQuery.length === 42) {
        // Try multiple chains for contract addresses
        const chains = ["ethereum", "base", "polygon", "arbitrum", "optimism"]
        let foundData = null

        for (const chain of chains) {
          try {
            response = await fetch(`https://api.dexscreener.com/tokens/v1/${chain}/${searchQuery}`)
            if (response.ok) {
              const chainData = await response.json()
              if (Array.isArray(chainData) && chainData.length > 0) {
                foundData = { pairs: chainData }
                break
              }
            }
          } catch (err) {
            console.log(`[v0] Failed to fetch from ${chain}:`, err)
            continue
          }
        }

        if (foundData) {
          data = foundData
        } else {
          // Fallback to search if no direct token found
          response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(searchQuery)}`)
          if (!response.ok) {
            throw new Error(`API Error: ${response.status}`)
          }
          data = await response.json()
        }
      } else {
        // Use search endpoint for names/symbols with better error handling
        response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(searchQuery)}`)
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`)
        }
        data = await response.json()
        console.log("[v0] Search response:", data)
      }

      if (!data || !data.pairs || !Array.isArray(data.pairs)) {
        console.log("[v0] No pairs found in response")
        setResults([])
        return
      }

      const filteredResults = data.pairs
        .filter((pair: TokenPair) => {
          const hasValidToken = pair.baseToken && pair.baseToken.address && pair.baseToken.symbol
          const hasValidPrice =
            pair.priceUsd && !isNaN(Number.parseFloat(pair.priceUsd)) && Number.parseFloat(pair.priceUsd) >= 0 // Allow zero prices
          const hasValidVolume = pair.volume && pair.volume.h24 !== undefined

          console.log("[v0] Filtering pair:", {
            symbol: pair.baseToken?.symbol,
            price: pair.priceUsd,
            hasValidToken,
            hasValidPrice,
            hasValidVolume,
          })

          return hasValidToken && (hasValidPrice || hasValidVolume)
        })
        .sort((a: TokenPair, b: TokenPair) => {
          // Sort by volume, then by liquidity, then by market cap
          const aVolume = a.volume?.h24 || 0
          const bVolume = b.volume?.h24 || 0
          if (bVolume !== aVolume) return bVolume - aVolume

          const aLiquidity = a.liquidity?.usd || 0
          const bLiquidity = b.liquidity?.usd || 0
          if (bLiquidity !== aLiquidity) return bLiquidity - aLiquidity

          const aMarketCap = a.marketCap || 0
          const bMarketCap = b.marketCap || 0
          return bMarketCap - aMarketCap
        })
        .slice(0, 20)

      console.log("[v0] Filtered results count:", filteredResults.length)
      setResults(filteredResults)
    } catch (err) {
      console.error("[v0] Token search error:", err)
      setError("Failed to search tokens. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchTokens(query)
    }, 500)

    return () => clearTimeout(timer)
  }, [query, searchTokens])

  const handleAddToWatchlist = (token: Token) => {
    addToWatchlist(token)
    if (onAddToWatchlist) {
      onAddToWatchlist(token)
    }
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

  const formatVolume = (volume: number | undefined) => {
    if (!volume || Number.isNaN(volume)) return "N/A"
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`
    if (volume >= 1000) return `$${(volume / 1000).toFixed(1)}K`
    return `$${volume.toFixed(0)}`
  }

  const formatPercentage = (change: number | undefined) => {
    if (change === undefined || change === null || Number.isNaN(change)) return "N/A"
    const sign = change >= 0 ? "+" : ""
    return `${sign}${change.toFixed(2)}%`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold">Search Tokens</h2>
      </div>

      <div className="relative animate-in fade-in duration-500">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search by name, symbol, or contract address..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 transition-all duration-200 focus:scale-[1.02] text-sm sm:text-base"
        />
      </div>

      {error && (
        <div className="text-center py-4 text-destructive animate-in fade-in duration-300 text-sm">{error}</div>
      )}

      {isLoading && (
        <div className="text-center py-8 animate-in fade-in duration-300">
          <div className="inline-flex items-center gap-2 text-muted-foreground text-sm">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Searching tokens...
          </div>
        </div>
      )}

      {!isLoading && query && results.length === 0 && !error && (
        <div className="text-center py-8 text-muted-foreground animate-in fade-in duration-300 text-sm">
          No tokens found for "{query}"
        </div>
      )}

      <div className="space-y-3">
        {results.map((pair, index) => {
          const inWatchlist = isInWatchlist(pair.baseToken.address)

          return (
            <Card
              key={`${pair.pairAddress}-${pair.chainId}`}
              className="hover:shadow-md transition-all duration-300 hover:scale-[1.02] animate-in slide-in-from-bottom duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm transition-all duration-200 hover:scale-110 flex-shrink-0">
                      {pair.baseToken.symbol?.charAt(0) || "?"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 sm:gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold truncate text-sm sm:text-base">
                          {pair.baseToken.name || pair.baseToken.symbol}
                        </h3>
                        <Badge variant="secondary" className="text-xs flex-shrink-0">
                          {pair.baseToken.symbol}
                        </Badge>
                        <Badge variant="outline" className="text-xs flex-shrink-0 hidden sm:inline-flex">
                          {pair.chainId}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground flex-wrap">
                        <span className="font-medium text-foreground">{formatPrice(pair.priceUsd)}</span>

                        {pair.priceChange?.h24 !== undefined && (
                          <div className="flex items-center gap-1">
                            {(pair.priceChange?.h24 || 0) >= 0 ? (
                              <TrendingUp className="w-3 h-3 text-green-500 flex-shrink-0" />
                            ) : (
                              <TrendingDown className="w-3 h-3 text-red-500 flex-shrink-0" />
                            )}
                            <span
                              className={cn(
                                "text-xs font-medium",
                                (pair.priceChange?.h24 || 0) >= 0 ? "text-green-500" : "text-red-500",
                              )}
                            >
                              {formatPercentage(pair.priceChange?.h24)}
                            </span>
                          </div>
                        )}

                        {pair.volume?.h24 && (
                          <span className="text-xs hidden sm:inline">Vol: {formatVolume(pair.volume?.h24)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant={inWatchlist ? "default" : "outline"}
                      onClick={() => !inWatchlist && handleAddToWatchlist(pair.baseToken)}
                      disabled={inWatchlist}
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0 transition-all duration-200 hover:scale-105"
                    >
                      {inWatchlist ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    </Button>

                    <Link href={`/token/${pair.baseToken.address}`}>
                      <Button
                        size="sm"
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 transition-all duration-200 hover:scale-105"
                      >
                        View
                      </Button>
                    </Link>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        try {
                          const { openExternal } = require('@/lib/browser')
                          openExternal(pair.url)
                        } catch (error) {
                          console.error('Failed to open external link:', error)
                        }
                      }}
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0 transition-all duration-200 hover:scale-105"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
