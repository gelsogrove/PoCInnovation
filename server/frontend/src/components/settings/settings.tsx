import React, { useState } from "react"
import Modal from "react-modal"
import "./settings.css"

// Assicurati che il modale si riferisca all'elemento radice
Modal.setAppElement("#root")

const Settings: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState<string | null>(null)

  // Funzione per aprire il popup centrato
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
                e.preventDefault() // Previeni il comportamento predefinito del link
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
                e.preventDefault() // Previeni il comportamento predefinito del link
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
                e.preventDefault() // Previeni il comportamento predefinito del link
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
        className="Modal"
        overlayClassName="Overlay"
      >
        {modalContent && (
          <iframe
            src={modalContent}
            style={{ width: "1300px", height: "700px", border: "none" }}
            title="Modal Content"
          />
        )}
      </Modal>
    </div>
  )
}

export default Settings
