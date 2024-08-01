// CustomModal.tsx
import React from "react"
import Modal from "react-modal"
import "./CustomModal.css" // Assicurati che il percorso sia corretto

Modal.setAppElement("#root")

interface CustomModalProps {
  isOpen: boolean
  onRequestClose: () => void
  contentType: "image" | "iframe"
  content: string | null
  vin?: string | null
}

const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onRequestClose,
  contentType,
  content,
  vin,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Custom Modal"
      className="Modal"
      overlayClassName="Overlay"
    >
      {contentType === "image" ? (
        content ? (
          <img
            src={content}
            alt="Modal Content"
            style={{ maxWidth: "100%", maxHeight: "100%" }}
          />
        ) : (
          <p>Loading...</p>
        )
      ) : contentType === "iframe" ? (
        content ? (
          <iframe
            src={content}
            style={{ width: "100%", height: "100%", border: "none" }}
            title="Modal Content"
          />
        ) : (
          <p>Loading...</p>
        )
      ) : null}
      <button onClick={onRequestClose} className="close-button">
        Close
      </button>

      {vin && vin.length === 17 && (
        <div className="modal-vin">
          <h1>
            <b>VIN:</b> {vin}
          </h1>
        </div>
      )}
    </Modal>
  )
}

export default CustomModal
