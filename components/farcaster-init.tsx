"use client"

import { useEffect } from "react"

export default function FarcasterInit() {
  useEffect(() => {
    ;(async () => {
      try {
        // Enable mock SDK only when explicitly requested via query param or environment variable.
        // For production, prefer setting NEXT_PUBLIC_FARCASTER_MOCK=1 in Vercel or your host to enable testing.
        const shouldMock =
          typeof window !== "undefined" &&
          (window.location.search.includes("farcaster_mock=1") || (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_FARCASTER_MOCK === '1'))

        if (shouldMock && typeof window !== "undefined" && !(window as any).sdk) {
          const mockSdk = {
            actions: {
              ready: () => Promise.resolve(),
              requestAuth: async () => true,
              getUser: async () => ({
                fid: 99999,
                username: "mock_trader",
                displayName: "Mock Trader",
                pfpUrl: "/diverse-user-avatars.png",
              }),
              notify: async (payload: any) => console.log("[mock sdk] notify", payload),
              sendNotification: async (payload: any) => console.log("[mock sdk] sendNotification", payload),
            },
            notifications: {
              send: async (payload: any) => console.log("[mock sdk] notifications.send", payload),
            },
            auth: {
              getUser: async () => ({
                fid: 99999,
                username: "mock_trader",
                displayName: "Mock Trader",
                pfpUrl: "/diverse-user-avatars.png",
              }),
              requestPermissions: async () => true,
            },
          }

          ;(window as any).sdk = mockSdk
          console.info("[farcaster-init] Injected mock Farcaster SDK for local testing")
        }

        const { ensureSdkReady } = await import("@/lib/farcaster-sdk")
        const ok = await ensureSdkReady()
        if (!ok) {
          console.info("[farcaster-init] Farcaster SDK not available; running in dev mode.")
        }
      } catch (err) {
        console.error("[farcaster-init] Failed to initialize Farcaster SDK:", err)
      }
    })()
  }, [])

  return null
}
