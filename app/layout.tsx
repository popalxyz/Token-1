import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Suspense } from "react"
import dynamic from "next/dynamic"

// Load the Farcaster init component as a client-side component
const FarcasterInit = dynamic(() => import("@/components/farcaster-init"), { ssr: false })

export const metadata: Metadata = {
  title: "Token Tracker - Farcaster Mini App",
  description: "Track your favorite tokens and set price alerts on Farcaster",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
      <body className="font-sans scroll-smooth">
        <FarcasterInit />
        <Suspense fallback={null}>{children}</Suspense>
      </body>
    </html>
  )
}
