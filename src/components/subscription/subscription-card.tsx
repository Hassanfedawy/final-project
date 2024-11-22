"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface SubscriptionCardProps {
  plan: string
  status: string
  monitors: {
    current: number
    max: number
  }
  features: string[]
  stripeCustomerId?: string | null
  cancelAtPeriodEnd?: boolean
}

export function SubscriptionCard({
  plan,
  status,
  monitors,
  features,
  stripeCustomerId,
  cancelAtPeriodEnd,
}: SubscriptionCardProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleManageSubscription = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/subscription/manage")
      const data = await response.json()

      if (data.url) {
        router.push(data.url)
      }
    } catch (error) {
      console.error("Error managing subscription:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">{plan} Plan</CardTitle>
          <Badge variant={status === "ACTIVE" ? "default" : "destructive"}>
            {status}
          </Badge>
        </div>
        <CardDescription>
          {cancelAtPeriodEnd
            ? "Your subscription will be cancelled at the end of the billing period"
            : "Manage your subscription and billing details"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Monitors Used</span>
            <span>
              {monitors.current} / {monitors.max}
            </span>
          </div>
          <Progress
            value={(monitors.current / monitors.max) * 100}
            className="h-2"
          />
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Plan Features</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            {features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        {stripeCustomerId ? (
          <Button
            className="w-full"
            onClick={handleManageSubscription}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Manage Subscription
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={() => router.push("/pricing")}
            variant="outline"
          >
            Upgrade Plan
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
