/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react"
import "./settings.css"

// Funzione per aprire il popup centrato
const openPopup = (url: string) => {
  // Specifiche del popup
  const width = 1300
  const height = 780

  // Calcola la posizione del popup per centrarlo
  const left = window.innerWidth / 2 - width / 2
  const top = window.innerHeight / 2 - height / 2

  // Apri il popup con le dimensioni e la posizione calcolata
  window.open(
    url,
    "popup",
    `width=${width},height=${height},left=${left},top=${top},scrollbars=no,resizable=no`
  )
}

const Settings: React.FC = () => {
  return (
    <div className="card">
      <h2>Settings</h2>
      <hr />
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
                openPopup("http://127.0.0.1:1880/#flow/94e3b6bceb5546d9")
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
                openPopup("http://127.0.0.1:1880/#flow/56d7af57f34d08fb")
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
                openPopup("http://127.0.0.1:1880/#flow/8f4823599e012ecf")
              }}
            >
              <b>Error flow</b>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
