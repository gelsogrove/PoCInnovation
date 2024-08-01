import React, { useEffect, useRef, useState } from "react"
import DefectModel from "../../models/DefectModel"
import CustomModal from "../customModal/CustomModal"
import "./DefectsTable.css"

interface DefectsTableProps {
  defects: DefectModel[]
}

const DefectsTable: React.FC<DefectsTableProps> = ({ defects }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedVin, setSelectedVin] = useState<string | null>(null)
  const [highlightedRowId, setHighlightedRowId] = useState<string | null>(null)
  const prevDefectsCountRef = useRef<number>(defects.length)

  useEffect(() => {
    // Check if the number of defects has increased
    if (defects.length > prevDefectsCountRef.current) {
      const newDefect = defects[defects.length - 1]
      setHighlightedRowId(newDefect._msgId)

      // Remove the highlight after 3 seconds
      const timeoutId = setTimeout(() => setHighlightedRowId(null), 3000)

      // Cleanup the timeout if the component unmounts or the effect reruns
      return () => clearTimeout(timeoutId)
    }

    // Update the previous defects count
    prevDefectsCountRef.current = defects.length
  }, [defects])

  const handleImageClick = (filepath: string) => {
    setSelectedImage(`http://localhost:3000/${filepath}`)
    setSelectedVin(filepath)
  }

  const handleCloseModal = () => {
    setSelectedImage(null)
    setSelectedVin(null) // Clear selectedVin when closing the modal
  }

  const sortedDefects = [...defects].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  )

  return (
    <>
      <div className="defects-table-container">
        <table className="defects-table">
          <thead>
            <tr>
              <th className="detection">DETECTION DEFECTS</th>
              <th className="details">DETAILS</th>
            </tr>
          </thead>
          <tbody>
            {sortedDefects.map((defect) => {
              const vin = defect.vin
                ? defect.vin.replace("images/VIN_", "").replace(/\.[^/.]+$/, "")
                : null

              return (
                <tr
                  key={defect._msgId}
                  className={
                    highlightedRowId === defect._msgId ? "highlight-new" : ""
                  }
                >
                  <td>
                    <img
                      src={`http://localhost:3000/${defect.vin}`}
                      alt="Defect"
                      onClick={() => handleImageClick(defect.vin)}
                      className="thumbnail"
                    />
                    <img
                      src={`http://localhost:3000/${defect.filepath}`}
                      alt="Defect"
                      onClick={() => handleImageClick(defect.filepath)}
                      className="thumbnail"
                    />
                  </td>
                  <td>
                    {vin ? (
                      <>
                        <b>VIN:</b> {vin}
                        <br />
                        <br />
                      </>
                    ) : null}
                    <b>Date:</b> {new Date(defect.data).toLocaleDateString()}
                    <br />
                    <b>Time:</b> {new Date(defect.data).toLocaleTimeString()}
                    <br />
                    <b>Defect: </b> Scratch
                    <br />
                    <b>Workshop: </b> T11
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <CustomModal
        isOpen={!!selectedImage}
        onRequestClose={handleCloseModal}
        contentType="image"
        content={selectedImage}
        vin={
          selectedVin
            ? selectedVin.replace("images/VIN_", "").replace(/\.[^/.]+$/, "")
            : ""
        }
      />
    </>
  )
}

export default DefectsTable
