/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect, useState } from "react"
import Modal from "../modal/Modal"
import "./DefectsTable.css"

interface Defect {
  _msgId: string
  data: string
  filepath: string
  workshop: string
  camera: string
}

const DefectsTable: React.FC = () => {
  const [defects, setDefects] = useState<Defect[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const [ws, setWs] = useState<WebSocket | null>(null)

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

  useEffect(() => {
    fetchDefects() // Initial fetch of defects
    createWebSocket() // Initialize WebSocket connection

    return () => {
      if (ws) {
        ws.close()
      }
    }
  }, [fetchDefects]) // Ensure fetchDefects is included in dependencies

  const handleImageClick = (filepath: string) => {
    setSelectedImage(`http://localhost:3000/${filepath}`)
  }

  const handleCloseModal = () => {
    setSelectedImage(null)
  }

  const sortedDefects = [...defects].sort((a, b) => {
    return new Date(b.data).getTime() - new Date(a.data).getTime()
  })

  return (
    <>
      <table className="defects-table">
        <thead>
          <tr>
            <th></th>
            <th>VIN NUMBER</th>
          </tr>
        </thead>
        <tbody>
          {sortedDefects.map((defect) => (
            <tr key={defect._msgId}>
              <td>
                <img
                  src={`http://localhost:3000/${defect.filepath}`}
                  alt="Defect"
                  onClick={() => handleImageClick(defect.filepath)}
                  className="thumbnail"
                />
              </td>
              <td>
                <b>ID:</b> {defect._msgId} <br />
                <br />
                <br />
                <b>Vin:</b> 1HBHD2DV4HHAAY65976DFHG Date:
                <br />
                <b>Date:</b>{" "}
                {new Date(defect.data).toLocaleString().substring(0, 10)}
                <br />
                <b>Time:</b>{" "}
                {new Date(defect.data).toLocaleString().substring(11)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedImage && (
        <Modal imageUrl={selectedImage} onClose={handleCloseModal} />
      )}
    </>
  )
}

export default DefectsTable
