import { Suspense } from "react"
import Dashboard from "@/components/dashboard"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard />
      </Suspense>
    </div>
  )
}
