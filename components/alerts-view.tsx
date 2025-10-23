"use client"

import { useAlertsStore } from "@/lib/alerts-store"
import { AlertCard } from "@/components/alert-card"
import { NotificationSettings } from "@/components/notification-settings"
import { Bell, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AlertsViewProps {
  onNavigateToSearch?: () => void
}

export function AlertsView({ onNavigateToSearch }: AlertsViewProps) {
  const { alerts } = useAlertsStore()
  const activeAlerts = alerts.filter((alert) => alert.isActive && !alert.triggeredAt)
  const triggeredAlerts = alerts.filter((alert) => alert.triggeredAt)

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold">Price Alerts</h2>
        <span className="text-xs sm:text-sm text-muted-foreground">{activeAlerts.length} active</span>
      </div>

      <NotificationSettings />

      {alerts.length === 0 ? (
        <div className="text-center py-8 sm:py-12 animate-in fade-in duration-700">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold mb-2">No alerts set</h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-4">
            Create price alerts to get notified when tokens reach your target prices
          </p>
          <Button className="gap-2 text-sm transition-all duration-200 hover:scale-105" onClick={onNavigateToSearch}>
            <Plus className="w-4 h-4" />
            Create Your First Alert
          </Button>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {triggeredAlerts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-semibold text-orange-600">Triggered Alerts</h3>
              {triggeredAlerts.map((alert, index) => (
                <div
                  key={alert.id}
                  className="animate-in slide-in-from-bottom duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <AlertCard alert={alert} />
                </div>
              ))}
            </div>
          )}

          {activeAlerts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-semibold">Active Alerts</h3>
              {activeAlerts.map((alert, index) => (
                <div
                  key={alert.id}
                  className="animate-in slide-in-from-bottom duration-300"
                  style={{ animationDelay: `${(index + triggeredAlerts.length) * 100}ms` }}
                >
                  <AlertCard alert={alert} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
