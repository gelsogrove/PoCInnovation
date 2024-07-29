import React, { useEffect, useState } from "react"
import "./DefectsTable.css"
import Modal from "./Modal"

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

  useEffect(() => {
    const fetchDefects = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/defects?workshop=T11"
        )
        const data = await response.json()
        setDefects(data)
      } catch (error) {
        console.error("Error fetching defects:", error)
      }
    }

    fetchDefects()
  }, [])

  const handleImageClick = (filepath: string) => {
    setSelectedImage(`http://localhost:3000/${filepath}`)
  }

  const handleCloseModal = () => {
    setSelectedImage(null)
  }

  // Ordina i difetti per data in modo decrescente
  const sortedDefects = [...defects].sort((a, b) => {
    return new Date(b.data).getTime() - new Date(a.data).getTime()
  })

  return (
    <>
      <table className="defects-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Datetime</th>
            <th>Workshop</th>
            <th>Camera</th>
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
              <td>{new Date(defect.data).toLocaleString()}</td>
              <td>{defect.workshop}</td>
              <td>{defect.camera}</td>
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
