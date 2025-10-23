"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { PriceAlert } from "./types"
import { farcasterNotifications } from "./farcaster-notifications"

interface AlertsStore {
  alerts: PriceAlert[]
  addAlert: (alert: Omit<PriceAlert, "id" | "createdAt">) => void
  removeAlert: (id: string) => void
  updateAlert: (id: string, updates: Partial<PriceAlert>) => void
  toggleAlert: (id: string) => void
  getActiveAlerts: () => PriceAlert[]
  checkAlerts: (tokenAddress: string, currentPrice: number) => Promise<PriceAlert[]>
  notificationsEnabled: boolean
  toggleNotifications: () => void
}

export const useAlertsStore = create<AlertsStore>()(
  persist(
    (set, get) => ({
      alerts: [],
      notificationsEnabled: true,

      addAlert: (alertData) => {
        const newAlert: PriceAlert = {
          ...alertData,
          id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
        }

        set((state) => ({
          alerts: [...state.alerts, newAlert],
        }))
      },

      removeAlert: (id: string) => {
        set((state) => ({
          alerts: state.alerts.filter((alert) => alert.id !== id),
        }))
      },

      updateAlert: (id: string, updates: Partial<PriceAlert>) => {
        set((state) => ({
          alerts: state.alerts.map((alert) => (alert.id === id ? { ...alert, ...updates } : alert)),
        }))
      },

      toggleAlert: (id: string) => {
        set((state) => ({
          alerts: state.alerts.map((alert) => (alert.id === id ? { ...alert, isActive: !alert.isActive } : alert)),
        }))
      },

      toggleNotifications: () => {
        set((state) => ({
          notificationsEnabled: !state.notificationsEnabled,
        }))
      },

      getActiveAlerts: () => {
        return get().alerts.filter((alert) => alert.isActive)
      },

      checkAlerts: async (tokenAddress: string, currentPrice: number) => {
        const alerts = get().alerts.filter(
          (alert) => alert.tokenAddress === tokenAddress && alert.isActive && !alert.triggeredAt,
        )

        const triggeredAlerts: PriceAlert[] = []

        for (const alert of alerts) {
          let shouldTrigger = false

          if (alert.alertType === "above" && alert.targetPrice && currentPrice >= alert.targetPrice) {
            shouldTrigger = true
          } else if (alert.alertType === "below" && alert.targetPrice && currentPrice <= alert.targetPrice) {
            shouldTrigger = true
          } else if (alert.alertType === "change" && alert.changePercentage) {
            // Calculate percentage change from the price when alert was created
            const basePrice = alert.basePrice || alert.targetPrice || currentPrice
            const percentageChange = ((currentPrice - basePrice) / basePrice) * 100

            if (Math.abs(percentageChange) >= Math.abs(alert.changePercentage)) {
              shouldTrigger = true
            }
          }

          if (shouldTrigger) {
            triggeredAlerts.push(alert)
            // Mark as triggered
            get().updateAlert(alert.id, { triggeredAt: new Date() })

            if (get().notificationsEnabled) {
              try {
                const notificationPayload = farcasterNotifications.formatAlertNotification(alert, currentPrice)
                await farcasterNotifications.sendNotification(notificationPayload)
              } catch (error) {
                console.error("[v0] Failed to send notification:", error)
              }
            }
          }
        }

        return triggeredAlerts
      },
    }),
    {
      name: "price-alerts-storage",
      version: 2, // Incremented version to handle migration
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          // Handle any necessary migrations from v1 to v2
          return {
            ...persistedState,
            alerts: persistedState.alerts || [],
            notificationsEnabled: persistedState.notificationsEnabled ?? true,
          }
        }
        return persistedState
      },
    },
  ),
)
