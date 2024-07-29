import React, { useEffect, useRef } from "react"
import "./Modal.css"

interface ModalProps {
  imageUrl: string
  onClose: () => void
}

const Modal: React.FC<ModalProps> = ({ imageUrl, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        <img src={imageUrl} alt="Defect" className="modal-image" />
      </div>
    </div>
  )
}

export default Modal
