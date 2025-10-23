// Core types for the Token Tracker app

export interface Token {
  address: string
  name: string
  symbol: string
  decimals: number
  logoURI?: string
  chainId: string
  priceUsd?: string
  priceChange24h?: number
  volume24h?: string
  marketCap?: string
  liquidity?: string
  fdv?: string
  pairAddress?: string
}

export interface TokenPair {
  chainId: string
  dexId: string
  url: string
  pairAddress: string
  baseToken: Token
  quoteToken: Token
  priceNative: string
  priceUsd?: string
  txns: {
    m5: { buys: number; sells: number }
    h1: { buys: number; sells: number }
    h6: { buys: number; sells: number }
    h24: { buys: number; sells: number }
  }
  volume: {
    h24: number
    h6: number
    h1: number
    m5: number
  }
  priceChange: {
    m5: number
    h1: number
    h6: number
    h24: number
  }
  liquidity?: {
    usd?: number
    base: number
    quote: number
  }
  fdv?: number
  marketCap?: number
  pairCreatedAt?: number
}

export interface WatchlistItem {
  id: string
  token: Token
  addedAt: Date
  notes?: string
}

export interface PriceAlert {
  id: string
  tokenAddress: string
  tokenSymbol: string
  tokenName: string
  alertType: "above" | "below" | "change"
  targetPrice?: number
  changePercentage?: number
  basePrice?: number
  isActive: boolean
  createdAt: Date
  triggeredAt?: Date
}

export interface User {
  fid: number
  username: string
  displayName: string
  pfpUrl: string
}
