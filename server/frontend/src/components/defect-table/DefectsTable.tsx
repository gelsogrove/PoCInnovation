/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react"
import DefectModel from "../../models/DefectModel"
import Modal from "../modal/Modal"
import "./DefectsTable.css"

interface DefectsTableProps {
  defects: DefectModel[]
}

const DefectsTable: React.FC<DefectsTableProps> = (props) => {
  const { defects } = props

  const [selectedImage, setSelectedImage] = useState<string | null>(null)

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
            <th className="headerth">DETECTION</th>
            <th className="headerth">DETAILS</th>
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
                <b>Vin:</b> 1HBHD2DV4HHAAY65976DFHG
                <br />
                <b>Date:</b>{" "}
                {new Date(defect.data).toLocaleString().substring(0, 10)}
                <br />
                <b>Time:</b>{" "}
                {new Date(defect.data).toLocaleString().substring(11)}
                <br />
                <b>Defect: </b>
                {"Scratch "}
                <br />
                <b>Workshop: </b>
                {"T11 "}
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
