import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react"
import type { ReactNode } from "react"

interface SensorCardProps {
  title: string
  value: number
  unit: string
  icon: ReactNode
  description: string
  trend: "up" | "down" | "stable"
}

export function SensorCard({ title, value, unit, icon, description, trend }: SensorCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value.toFixed(1)} {unit}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <div className="mt-2 flex items-center text-xs">
          {trend === "up" ? (
            <ArrowUp className="mr-1 h-3 w-3 text-emerald-500" />
          ) : trend === "down" ? (
            <ArrowDown className="mr-1 h-3 w-3 text-rose-500" />
          ) : (
            <ArrowRight className="mr-1 h-3 w-3 text-muted-foreground" />
          )}
          <span
            className={
              trend === "up" ? "text-emerald-500" : trend === "down" ? "text-rose-500" : "text-muted-foreground"
            }
          >
            {trend === "up" ? "Increasing" : trend === "down" ? "Decreasing" : "Stable"}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
