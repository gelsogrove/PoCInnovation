/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react"
import Modal from "react-modal"
import "../customModal/CustomModal.css" // Assicurati che il percorso sia corretto
import "./settings.css" // Assicurati che il percorso sia corretto

Modal.setAppElement("#root")

const Settings: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState<string | null>(null)

  const openModal = (url: string) => {
    setModalContent(url)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setModalContent(null)
  }

  // Funzione per formattare la data e ora di ieri
  const formatDateTime = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    const seconds = String(date.getSeconds()).padStart(2, "0")

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
  }

  // Calcola la data di ieri e formatta la data e ora
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const formattedDateTime = formatDateTime(yesterday) // Es. "29/07/2024 11:40:40"

  return (
    <div className="card">
      <h2>Settings</h2>
      <div className="settings-list">
        <div className="block">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              openModal("http://127.0.0.1:1880/#flow/e5ff7f387ec0af58")
            }}
          >
            <b>Advance Settings</b>
            <span className="status active">Active</span>
          </a>
        </div>

        <div className="block">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              openModal("http://127.0.0.1:1880/#flow/94e3b6bceb5546d9")
            }}
          >
            <b>Health Check</b>
            <span className="status active">Active</span>
          </a>
        </div>
        <div className="block">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              openModal("http://127.0.0.1:1880/#flow/56d7af57f34d08fb")
            }}
          >
            <b>Post detection flow</b>
            <span className="status active">Active</span>
          </a>
        </div>
        <div className="block">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              openModal("http://127.0.0.1:1880/#flow/8f4823599e012ecf")
            }}
          >
            <b>Catch Errors flow</b>
            <span className="status active">Active</span>
          </a>
        </div>
      </div>
      <div className="last-update">Last update: {formattedDateTime}</div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Popup Content"
        className="settings-Modal"
        overlayClassName="settings-Overlay"
      >
        {modalContent && (
          <iframe
            src={modalContent}
            style={{ width: "100%", height: "100%", border: "none" }}
            title="Modal Content"
          />
        )}
      </Modal>
    </div>
  )
}

export default Settings
