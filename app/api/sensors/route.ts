import { NextResponse } from "next/server"
import mysql from "mysql2/promise"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const lastTimestamp = url.searchParams.get("timestamp")

    // Create a connection to the database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "sensor_db",
    })

    // Query to fetch data
    const query = lastTimestamp
      ? `
        SELECT id, timestamp, nilai_lumen, nilai_suhu, nilai_kelembapan
        FROM sensor_ruangan
        WHERE timestamp > ?
        ORDER BY timestamp ASC
      `
      : `
        SELECT id, timestamp, nilai_lumen, nilai_suhu, nilai_kelembapan
        FROM sensor_ruangan
        ORDER BY timestamp DESC
        LIMIT 10
      `

    const [rows] = await connection.execute(query, lastTimestamp ? [lastTimestamp] : [])

    // Close the connection
    await connection.end()

    // Return the data
    return NextResponse.json(Array.isArray(rows) ? rows : [])
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch sensor data" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { lumen, suhu, kelembapan } = await req.json()

    if (lumen == null || suhu == null || kelembapan == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create a connection to the database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "sensor_db",
    })

    // Insert the new data
    await connection.execute(
      `INSERT INTO sensor_ruangan (nilai_lumen, nilai_suhu, nilai_kelembapan) VALUES (?, ?, ?)`,
      [lumen, suhu, kelembapan]
    )

    // Delete older records, keeping only the latest 10
    await connection.execute(`
      DELETE FROM sensor_ruangan 
      WHERE id NOT IN (
        SELECT id FROM (
          SELECT id FROM sensor_ruangan 
          ORDER BY timestamp DESC 
          LIMIT 10
        ) AS sub
      )
    `)

    // Close the connection
    await connection.end()

    return NextResponse.json({ message: "Data saved successfully" })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 })
  }
}
