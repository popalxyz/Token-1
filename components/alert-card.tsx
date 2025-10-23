"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Bell, BellOff, Trash2, TrendingUp, TrendingDown, Activity } from "lucide-react"
import type { PriceAlert } from "@/lib/types"
import { useAlertsStore } from "@/lib/alerts-store"
import { cn } from "@/lib/utils"

interface AlertCardProps {
  alert: PriceAlert
}

export function AlertCard({ alert }: AlertCardProps) {
  const { removeAlert, toggleAlert } = useAlertsStore()

  const getAlertIcon = () => {
    switch (alert.alertType) {
      case "above":
        return <TrendingUp className="w-4 h-4" />
      case "below":
        return <TrendingDown className="w-4 h-4" />
      case "change":
        return <Activity className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getAlertDescription = () => {
    switch (alert.alertType) {
      case "above":
        return `When price goes above $${alert.targetPrice?.toLocaleString()}`
      case "below":
        return `When price goes below $${alert.targetPrice?.toLocaleString()}`
      case "change":
        const sign = (alert.changePercentage || 0) >= 0 ? "+" : ""
        return `When price changes by ${sign}${alert.changePercentage}%`
      default:
        return "Price alert"
    }
  }

  const getStatusColor = () => {
    if (alert.triggeredAt) return "text-orange-500"
    if (alert.isActive) return "text-green-500"
    return "text-muted-foreground"
  }

  const getStatusText = () => {
    if (alert.triggeredAt) return "Triggered"
    if (alert.isActive) return "Active"
    return "Inactive"
  }

  return (
    /* Added hover animations and pulse effect for triggered alerts */
    <Card
      className={cn(
        "transition-all duration-300 hover:scale-[1.02] animate-in fade-in duration-500 group",
        alert.triggeredAt &&
          "border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20 animate-pulse",
        alert.isActive &&
          !alert.triggeredAt &&
          "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all duration-200 group-hover:scale-110">
              {alert.tokenSymbol?.charAt(0) || "?"}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{alert.tokenName}</h3>
                <Badge variant="secondary" className="text-xs">
                  {alert.tokenSymbol}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {getAlertIcon()}
                <span>{getAlertDescription()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className={cn("text-xs font-medium", getStatusColor())}>{getStatusText()}</span>
              {alert.isActive ? (
                <Bell className="w-3 h-3 text-green-500" />
              ) : (
                <BellOff className="w-3 h-3 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Created {alert.createdAt.toLocaleDateString()}
            {alert.triggeredAt && (
              <span className="ml-2 text-orange-600">• Triggered {alert.triggeredAt.toLocaleDateString()}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={alert.isActive}
              onCheckedChange={() => toggleAlert(alert.id)}
              disabled={!!alert.triggeredAt}
              className="transition-all duration-200"
            />

            <Button
              size="sm"
              variant="ghost"
              onClick={() => removeAlert(alert.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive transition-all duration-200 hover:scale-110"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
