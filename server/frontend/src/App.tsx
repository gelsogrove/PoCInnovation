/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useState } from "react"
import "./App.css"
import DefectsTable from "./components/defect-table/DefectsTable"
import Settings from "./components/settings/settings"
import Statistics from "./components/statistics/statistics"
import DefectModel from "./models/DefectModel"

const processDefects = (defects: DefectModel[]): DefectModel[] => {
  // Crea una copia dell'array dei difetti per modificare senza alterare lo stato direttamente
  const updatedDefects = [...defects]

  // Trova gli indici dei record con `vin` null
  for (let i = 0; i < updatedDefects.length - 1; i++) {
    if (updatedDefects[i].vin === null && updatedDefects[i + 1]) {
      // Sostituisci il vin del record precedente con quello del record successivo
      updatedDefects[i].vin = updatedDefects[i + 1].vin

      // Verifica se i due record hanno lo stesso filepath
      if (updatedDefects[i].filepath === updatedDefects[i + 1].filepath) {
        // Rimuovi il record successivo
        updatedDefects.splice(i + 1, 1)
      }
    }
  }

  return updatedDefects
}

const App: React.FC = () => {
  const [defects, setDefects] = useState<DefectModel[]>([])
  const [ws, setWs] = useState<WebSocket | null>(null)

  const createWebSocket = () => {
    const websocket = new WebSocket("ws://localhost:1880/ws/refresh")

    websocket.onopen = () => {
      console.log("WebSocket connection established")
    }

    websocket.onmessage = (event) => {
      console.log("WebSocket message received:", event.data)

      fetchDefects()
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

      // Process defects to update vin values
      const processedDefects = processDefects(data)

      setDefects(processedDefects)
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
          <Statistics defects={defects} />
          <Settings />
        </div>
      </div>
    </div>
  )
}

export default App
