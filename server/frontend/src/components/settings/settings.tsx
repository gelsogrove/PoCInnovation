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

  return (
    <div className="card">
      <h2>Settings</h2>
      <div className="settings-list">
        <div>
          <div className="block">
            <b>Status</b>: <span className="green">Active</span>
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
              <b>Error flow</b>
            </a>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Popup Content"
        className="settings-Modal" // Classe CSS specifica
        overlayClassName="settings-Overlay" // Classe CSS specifica
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
