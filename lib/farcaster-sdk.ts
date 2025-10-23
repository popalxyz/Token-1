"use client"

// Lightweight helper to detect and initialize the Farcaster Mini App SDK
let _initialized = false

export function isFarcasterRuntime(): boolean {
  if (typeof window === "undefined") return false
  const anyWin = window as any
  return !!(anyWin.sdk && anyWin.sdk.actions && typeof anyWin.sdk.actions.ready === "function")
}

export async function ensureSdkReady(timeout = 3000): Promise<boolean> {
  if (_initialized) return true
  // Poll for SDK presence for up to `timeout` ms
  const start = Date.now()
  while (Date.now() - start < timeout) {
    if ((window as any).sdk && (window as any).sdk.actions && typeof (window as any).sdk.actions.ready === "function") {
      try {
        await (window as any).sdk.actions.ready()
        _initialized = true
        console.log("[farcaster-sdk] sdk.actions.ready() resolved")
        return true
      } catch (err) {
        console.error("[farcaster-sdk] sdk.actions.ready() rejected:", err)
        return false
      }
    }
    // wait a bit before retrying
    await new Promise((r) => setTimeout(r, 150))
  }

  // If we reach here, SDK wasn't found within timeout
  console.warn("[farcaster-sdk] Farcaster SDK not detected in window (not running inside Farcaster Mini App or injection delayed).")
  return false
}

export function getSdk(): any {
  if (typeof window === "undefined") return undefined
  return (window as any).sdk
}

// Try to read a Farcaster user profile from the injected SDK, with several fallbacks.
export async function getFarcasterUser(): Promise<{
  fid: number
  username: string
  displayName: string
  pfpUrl: string
} | null> {
  if (!isFarcasterRuntime()) return null

  const sdk = getSdk()
  if (!sdk) return null

  try {
    // Common possible SDK shapes — try a few heuristics
    if (sdk.actions && typeof sdk.actions.getUser === "function") {
      const u = await sdk.actions.getUser()
      return normalizeUser(u)
    }

    if (sdk.auth && typeof sdk.auth.getUser === "function") {
      const u = await sdk.auth.getUser()
      return normalizeUser(u)
    }

    // Some runtimes expose a simple `user` or `account` object
    if (sdk.user) return normalizeUser(sdk.user)
    if (sdk.account) return normalizeUser(sdk.account)

    // As a last resort, try reading top-level fields
    const maybe = {
      fid: sdk.fid || sdk.id || (sdk.account && sdk.account.fid) || 0,
      username: sdk.username || sdk.handle || (sdk.account && sdk.account.username) || "",
      displayName: sdk.displayName || sdk.name || "",
      pfpUrl: sdk.pfp || sdk.avatar || "",
    }
    if (maybe.fid) return maybe as any
  } catch (err) {
    console.warn("[farcaster-sdk] getFarcasterUser failed:", err)
  }

  return null
}

function normalizeUser(u: any) {
  if (!u) return null
  const fid = u.fid || u.id || (u.account && u.account.fid) || 0
  const username = u.username || u.handle || (u.account && u.account.username) || ""
  const displayName = u.displayName || u.name || u.display_name || ""
  const pfpUrl = u.pfpUrl || u.avatar || u.pfp || ""
  if (!fid) return null
  return {
    fid,
    username,
    displayName,
    pfpUrl,
  }
}

// Try to request authorization from the runtime if an API exists.
export async function requestAuth(): Promise<boolean> {
  if (!isFarcasterRuntime()) return false
  const sdk = getSdk()
  try {
    if (sdk.auth && typeof sdk.auth.requestPermissions === "function") {
      await sdk.auth.requestPermissions()
      return true
    }
    if (sdk.actions && typeof sdk.actions.requestAuth === "function") {
      await sdk.actions.requestAuth()
      return true
    }
    // Some runtimes expose a simple `authorize` method
    if (typeof sdk.authorize === "function") {
      await sdk.authorize()
      return true
    }
  } catch (err) {
    console.warn("[farcaster-sdk] requestAuth failed:", err)
  }
  return false
}
