"use client"

import { useWatchlistStore } from "@/lib/watchlist-store"
import { WatchlistCard } from "@/components/watchlist-card"
import { TrendingUp, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WatchlistViewProps {
  onNavigateToSearch?: () => void
}

export function WatchlistView({ onNavigateToSearch }: WatchlistViewProps) {
  const { watchlist } = useWatchlistStore()

  if (watchlist.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8 sm:py-12 animate-in fade-in duration-700">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold mb-2">No tokens in watchlist</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-4">
            Start by searching for tokens and adding them to your watchlist
          </p>
          <Button className="gap-2 text-sm transition-all duration-200 hover:scale-105" onClick={onNavigateToSearch}>
            <Plus className="w-4 h-4" />
            Add Your First Token
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold">My Watchlist</h2>
        <span className="text-xs sm:text-sm text-muted-foreground">{watchlist.length} tokens</span>
      </div>

      <div className="space-y-3">
        {watchlist.map((item, index) => (
          <div
            key={item.id}
            className="animate-in slide-in-from-bottom duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <WatchlistCard item={item} />
          </div>
        ))}
      </div>
    </div>
  )
}
