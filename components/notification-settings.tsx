"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Smartphone } from "lucide-react"
import { useAlertsStore } from "@/lib/alerts-store"
import { farcasterNotifications } from "@/lib/farcaster-notifications"
import { useState, useEffect } from "react"

export function NotificationSettings() {
  const { notificationsEnabled, toggleNotifications } = useAlertsStore()
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>("default")
  const [isConfiguring, setIsConfiguring] = useState(false)

  useEffect(() => {
    if ("Notification" in window) {
      setBrowserPermission(Notification.permission)
    }
  }, [])

  const handleRequestPermission = async () => {
    setIsConfiguring(true)
    const granted = await farcasterNotifications.requestNotificationPermission()
    if (granted) {
      setBrowserPermission("granted")
      // Enable notifications in store if permission granted
      if (!notificationsEnabled) {
        toggleNotifications()
      }
    }
    setIsConfiguring(false)
  }

  const handleTestNotification = async () => {
    await farcasterNotifications.sendNotification({
      title: "🧪 Test Alert",
      body: "Your Farcaster notifications are working! You'll receive alerts when your price targets are hit.",
      targetUrl: "/alerts",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Farcaster Notifications Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">Farcaster Notifications</span>
              <Badge variant={notificationsEnabled ? "default" : "secondary"}>
                {notificationsEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Get notified on Farcaster when your price alerts trigger</p>
          </div>
          <Switch checked={notificationsEnabled} onCheckedChange={toggleNotifications} />
        </div>

        {/* Browser Permission Status */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              <span className="font-medium">Browser Notifications</span>
              <Badge variant={browserPermission === "granted" ? "default" : "outline"}>
                {browserPermission === "granted" ? "Allowed" : browserPermission === "denied" ? "Blocked" : "Not Set"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Fallback notifications in your browser</p>
          </div>
          {browserPermission !== "granted" && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleRequestPermission}
              disabled={isConfiguring || browserPermission === "denied"}
            >
              {isConfiguring ? "Requesting..." : "Enable"}
            </Button>
          )}
        </div>

        {/* Test Notification */}
        {notificationsEnabled && (
          <div className="pt-2 border-t">
            <Button size="sm" variant="outline" onClick={handleTestNotification} className="w-full bg-transparent">
              <Bell className="w-4 h-4 mr-2" />
              Send Test Notification
            </Button>
          </div>
        )}

        {/* Configuration Note */}
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
          <p className="font-medium mb-1">🔧 Development Mode</p>
          <p>
            Currently using simulated notifications. In production, this would integrate with Farcaster's Mini App
            notification API to send real notifications to your Farcaster client.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
