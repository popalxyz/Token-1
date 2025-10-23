"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Plus } from "lucide-react"
import { useAlertsStore } from "@/lib/alerts-store"
import type { Token } from "@/lib/types"

interface CreateAlertDialogProps {
  token?: Token
  trigger?: React.ReactNode
}

export function CreateAlertDialog({ token, trigger }: CreateAlertDialogProps) {
  const [open, setOpen] = useState(false)
  const [alertType, setAlertType] = useState<"above" | "below" | "change">("above")
  const [targetPrice, setTargetPrice] = useState("")
  const [changePercentage, setChangePercentage] = useState("")
  const [tokenAddress, setTokenAddress] = useState(token?.address || "")
  const [tokenSymbol, setTokenSymbol] = useState(token?.symbol || "")
  const [tokenName, setTokenName] = useState(token?.name || "")

  const { addAlert } = useAlertsStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!tokenAddress || !tokenSymbol) {
      alert("Please provide token information")
      return
    }

    if (alertType !== "change" && !targetPrice) {
      alert("Please enter a target price")
      return
    }

    if (alertType === "change" && !changePercentage) {
      alert("Please enter a percentage change")
      return
    }

    addAlert({
      tokenAddress,
      tokenSymbol,
      tokenName: tokenName || tokenSymbol,
      alertType,
      targetPrice: alertType !== "change" ? Number.parseFloat(targetPrice) : undefined,
      changePercentage: alertType === "change" ? Number.parseFloat(changePercentage) : undefined,
      isActive: true,
    })

    // Reset form
    setTargetPrice("")
    setChangePercentage("")
    if (!token) {
      setTokenAddress("")
      setTokenSymbol("")
      setTokenName("")
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            add Alert
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Create Price Alert
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!token && (
            <div className="space-y-2">
              <Label htmlFor="token-address">Token Address</Label>
              <Input
                id="token-address"
                placeholder="0x..."
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                required
              />
            </div>
          )}

          {!token && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="token-symbol">Symbol</Label>
                <Input
                  id="token-symbol"
                  placeholder="ETH"
                  value={tokenSymbol}
                  onChange={(e) => setTokenSymbol(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="token-name">Name (optional)</Label>
                <Input
                  id="token-name"
                  placeholder="Ethereum"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                />
              </div>
            </div>
          )}

          {token && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {token.symbol?.charAt(0) || "?"}
                </div>
                <div>
                  <p className="font-medium">{token.name || token.symbol}</p>
                  <p className="text-sm text-muted-foreground">{token.symbol}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="alert-type">Alert Type</Label>
            <Select value={alertType} onValueChange={(value: "above" | "below" | "change") => setAlertType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="above">Price goes above</SelectItem>
                <SelectItem value="below">Price goes below</SelectItem>
                <SelectItem value="change">Price changes by %</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {alertType !== "change" ? (
            <div className="space-y-2">
              <Label htmlFor="target-price">Target Price (USD)</Label>
              <Input
                id="target-price"
                type="number"
                step="any"
                placeholder="0.00"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                required
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="change-percentage">Percentage Change</Label>
              <Input
                id="change-percentage"
                type="number"
                step="any"
                placeholder="5.0"
                value={changePercentage}
                onChange={(e) => setChangePercentage(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Positive for increase, negative for decrease (e.g., 10 for +10%, -5 for -5%)
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Alert</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
