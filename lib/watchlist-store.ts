"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Token, WatchlistItem } from "./types"

interface WatchlistStore {
  watchlist: WatchlistItem[]
  addToWatchlist: (token: Token, notes?: string) => void
  removeFromWatchlist: (tokenAddress: string) => void
  updateWatchlistItem: (id: string, updates: Partial<WatchlistItem>) => void
  isInWatchlist: (tokenAddress: string) => boolean
  getWatchlistItem: (tokenAddress: string) => WatchlistItem | undefined
}

export const useWatchlistStore = create<WatchlistStore>()(
  persist(
    (set, get) => ({
      watchlist: [],

      addToWatchlist: (token: Token, notes?: string) => {
        if (!token || !token.address || !token.symbol) {
          console.error("Invalid token data provided to watchlist")
          return
        }

        const existing = get().watchlist.find((item) => item.token.address === token.address)
        if (existing) return // Already in watchlist

        const newItem: WatchlistItem = {
          id: `${token.address}-${Date.now()}`,
          token,
          addedAt: new Date(),
          notes,
        }

        set((state) => ({
          watchlist: [...state.watchlist, newItem],
        }))
      },

      removeFromWatchlist: (tokenAddress: string) => {
        if (!tokenAddress) {
          console.error("Invalid token address provided for removal")
          return
        }

        set((state) => ({
          watchlist: state.watchlist.filter((item) => item.token.address !== tokenAddress),
        }))
      },

      updateWatchlistItem: (id: string, updates: Partial<WatchlistItem>) => {
        if (!id || !updates) {
          console.error("Invalid parameters provided for watchlist update")
          return
        }

        set((state) => ({
          watchlist: state.watchlist.map((item) => (item.id === id ? { ...item, ...updates } : item)),
        }))
      },

      isInWatchlist: (tokenAddress: string) => {
        if (!tokenAddress) return false
        return get().watchlist.some((item) => item.token.address === tokenAddress)
      },

      getWatchlistItem: (tokenAddress: string) => {
        if (!tokenAddress) return undefined
        return get().watchlist.find((item) => item.token.address === tokenAddress)
      },
    }),
    {
      name: "token-watchlist-storage",
      version: 2, // Incremented version to handle migration
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          // Handle any necessary migrations from v1 to v2
          return {
            ...persistedState,
            watchlist: persistedState.watchlist || [],
          }
        }
        return persistedState
      },
    },
  ),
)
