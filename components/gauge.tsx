"use client"

import { useEffect, useRef } from "react"

interface ColorStop {
  value: number
  color: string
}

interface GaugeProps {
  value: number
  min: number
  max: number
  label: string
  colorScheme: ColorStop[]
}

export function Gauge({ value, min, max, label, colorScheme }: GaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const width = canvas.width
    const height = canvas.height
    const radius = (Math.min(width, height) / 2) * 0.8
    const centerX = width / 2
    const centerY = height / 2

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw background arc
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI, false)
    ctx.lineWidth = 20
    ctx.strokeStyle = "#e5e7eb"
    ctx.stroke()

    // Calculate angle for current value
    const range = max - min
    const valuePercent = (value - min) / range
    const angle = Math.PI + valuePercent * Math.PI

    // Create gradient for value arc
    const gradient = ctx.createLinearGradient(0, 0, width, 0)
    colorScheme.forEach((stop) => {
      const percent = (stop.value - min) / range
      gradient.addColorStop(percent, stop.color)
    })

    // Draw value arc
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI, angle, false)
    ctx.lineWidth = 20
    ctx.strokeStyle = gradient
    ctx.stroke()

    // Draw center circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.1, 0, 2 * Math.PI, false)
    ctx.fillStyle = "#000"
    ctx.fill()

    // Draw needle
    const needleLength = radius * 0.8
    const needleWidth = 4

    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(angle)

    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(needleLength, 0)
    ctx.lineWidth = needleWidth
    ctx.strokeStyle = "#000"
    ctx.stroke()

    ctx.restore()

    // Draw value text
    ctx.font = "bold 24px sans-serif"
    ctx.fillStyle = "#000"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(label, centerX, centerY + radius * 0.5)
  }, [value, min, max, label, colorScheme])

  return (
    <div className="relative w-full max-w-[300px]">
      <canvas ref={canvasRef} width={300} height={200} className="w-full" />
    </div>
  )
}
