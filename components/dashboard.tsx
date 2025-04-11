"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Gauge } from "@/components/gauge"
import { SensorCard } from "@/components/sensor-card"
import { ThermometerIcon, Droplets, Wind, GaugeIcon } from "lucide-react"

// Define the sensor data type based on your database schema
interface SensorData {
  id: number
  timestamp: string
  nilai_lumen: number
  nilai_suhu: number
  nilai_kelembapan: number
}

export default function Dashboard() {
  const [sensorData, setSensorData] = useState<SensorData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async (lastTimestamp?: string) => {
      try {
        setLoading(true)
        const url = lastTimestamp ? `/api/sensors?timestamp=${lastTimestamp}` : "/api/sensors"
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error("Failed to fetch sensor data")
        }

        const data = await response.json()
        setSensorData((prevData) => (lastTimestamp ? [...prevData, ...data] : data))
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        console.error("Error fetching sensor data:", err)
      } finally {
        setLoading(false)
      }
    }

    // Fetch initial data
    fetchData()

    // Set up polling every 5 seconds
    const intervalId = setInterval(() => {
      const lastTimestamp = sensorData.length > 0 ? sensorData[sensorData.length - 1].timestamp : undefined
      fetchData(lastTimestamp)
    }, 5000)

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [sensorData])

  // Get the latest sensor reading
  const latestReading = sensorData.length > 0 ? sensorData[sensorData.length - 1] : null

  // Format data for charts
  const formattedData = sensorData.map((reading) => ({
    ...reading,
    timestamp: new Date(reading.timestamp).toLocaleTimeString(),
  }))

  if (loading && sensorData.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">IoT Sensor Dashboard</h1>
        <p className="text-muted-foreground">Monitor your room environment in real-time</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SensorCard
          title="Temperature"
          value={latestReading?.nilai_suhu ?? 0}
          unit="°C"
          icon={<ThermometerIcon className="h-4 w-4" />}
          description="Current room temperature"
          trend={
            sensorData.length > 1
              ? latestReading!.nilai_suhu > sensorData[sensorData.length - 2].nilai_suhu
                ? "up"
                : "down"
              : "stable"
          }
        />

        <SensorCard
          title="Humidity"
          value={latestReading?.nilai_kelembapan ?? 0}
          unit="%"
          icon={<Droplets className="h-4 w-4" />}
          description="Current room humidity"
          trend={
            sensorData.length > 1
              ? latestReading!.nilai_kelembapan > sensorData[sensorData.length - 2].nilai_kelembapan
                ? "up"
                : "down"
              : "stable"
          }
        />

        <SensorCard
          title="Lumen"
          value={latestReading?.nilai_lumen ?? 0}
          unit="lm"
          icon={<GaugeIcon className="h-4 w-4" />}
          description="Light intensity"
          trend={
            sensorData.length > 1
              ? latestReading!.nilai_lumen > sensorData[sensorData.length - 2].nilai_lumen
                ? "up"
                : "down"
              : "stable"
          }
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="temperature">Temperature</TabsTrigger>
          <TabsTrigger value="humidity">Humidity</TabsTrigger>
          <TabsTrigger value="pressure">Pressure</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Temperature Trend</CardTitle>
                <CardDescription>Last 10 readings</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={formattedData}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="nilai_suhu"
                      stroke="#f97316"
                      fillOpacity={1}
                      fill="url(#colorTemp)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Humidity Trend</CardTitle>
                <CardDescription>Last 10 readings</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={formattedData}>
                    <defs>
                      <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="nilai_kelembapan" stroke="#3b82f6" fillOpacity={1} fill="url(#colorHum)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Latest Readings</CardTitle>
              <CardDescription>
                Last updated: {latestReading ? new Date(latestReading.timestamp).toLocaleString() : "N/A"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Time</th>
                      <th className="text-left p-2">Temperature</th>
                      <th className="text-left p-2">Humidity</th>
                      <th className="text-left p-2">Lumen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sensorData
                      .slice()
                      .reverse()
                      .map((reading) => (
                        <tr key={reading.id} className="border-b">
                          <td className="p-2">{new Date(reading.timestamp).toLocaleTimeString()}</td>
                          <td className="p-2">{reading.nilai_suhu} °C</td>
                          <td className="p-2">{reading.nilai_kelembapan} %</td>
                          <td className="p-2">{reading.nilai_lumen} lm</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="temperature" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Temperature Analysis</CardTitle>
              <CardDescription>Detailed temperature readings</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="nilai_suhu" stroke="#f97316" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Current Temperature</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Gauge
                  value={latestReading?.nilai_suhu ?? 0}
                  min={0}
                  max={40}
                  label={`${latestReading?.nilai_suhu ?? 0}°C`}
                  colorScheme={[
                    { value: 10, color: "#3b82f6" },
                    { value: 25, color: "#22c55e" },
                    { value: 40, color: "#f97316" },
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Temperature Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average</span>
                    <span className="font-medium">
                      {sensorData.length > 0
                        ? (
                            sensorData.reduce((sum, reading) => sum + reading.nilai_suhu, 0) / sensorData.length
                          ).toFixed(1)
                        : "N/A"}{" "}
                      °C
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Minimum</span>
                    <span className="font-medium">
                      {sensorData.length > 0
                        ? Math.min(...sensorData.map((reading) => reading.nilai_suhu)).toFixed(1)
                        : "N/A"}{" "}
                      °C
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Maximum</span>
                    <span className="font-medium">
                      {sensorData.length > 0
                        ? Math.max(...sensorData.map((reading) => reading.nilai_suhu)).toFixed(1)
                        : "N/A"}{" "}
                      °C
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="humidity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Humidity Analysis</CardTitle>
              <CardDescription>Detailed humidity readings</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="nilai_kelembapan" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pressure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pressure Analysis</CardTitle>
              <CardDescription>Detailed pressure readings</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="nilai_lumen" stroke="#22c55e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
