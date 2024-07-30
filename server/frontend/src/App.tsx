/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useState } from "react"
import "./App.css"
import DefectsTable from "./components/defect-table/DefectsTable"
import Settings from "./components/settings/settings"
import Statistics from "./components/statistics/statistics"
import DefectModel from "./models/DefectModel"

const App: React.FC = () => {
  const [defects, setDefects] = useState<DefectModel[]>([])
  const [ws, setWs] = useState<WebSocket | null>(null)

  const createWebSocket = () => {
    const websocket = new WebSocket("ws://localhost:3000")

    websocket.onopen = () => {
      console.log("WebSocket connection established")
    }

    websocket.onmessage = (event) => {
      console.log("WebSocket message received:", event.data)
      if (event.data === "refresh") {
        fetchDefects() // Call fetchDefects here
      }
    }

    websocket.onclose = (event) => {
      console.log("WebSocket connection closed...", event)
      // Attempt to reconnect after a delay
      setTimeout(createWebSocket, 5000)
    }

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error)
    }

    setWs(websocket)
  }

  // Define fetchDefects as a callback function
  const fetchDefects = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:3000/defects?workshop=T11")
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const data = await response.json()

      setDefects(data)
    } catch (error) {
      console.error("Error fetching defects:", error)
    }
  }, [])

  useEffect(() => {
    fetchDefects() // Initial fetch of defects
    createWebSocket() // Initialize WebSocket connection

    return () => {
      if (ws) {
        ws.close()
      }
    }
  }, [fetchDefects])

  return (
    <div className="App">
      <div className="container">
        <div>
          <h1>Poc - Object detection</h1>
          <div className="defects-table-container">
            <DefectsTable defects={defects} />
          </div>
        </div>
        <div className="cards-container">
          <Statistics />
          <Settings />
        </div>
      </div>
    </div>
  )
}

export default App
