import React from "react"
import "./settings.css"

const Settings: React.FC = () => {
  return (
    <div className="card">
      <h2>Settings</h2>
      <div className="settings-list">
        <div>
          <div className="block">
            <b>Status</b>: <span className="green">Active</span>
          </div>
          <div className="block">
            <a href="http://127.0.0.1:1880/#flow/b56b851c180cbc4b">
              <b>Pre detection flow</b>
            </a>
          </div>
          <div className="block">
            <a href="http://127.0.0.1:1880/#flow/56d7af57f34d08fb">
              <b>Post detection flow</b>
            </a>
          </div>
          <div className="block">
            <a href="http://127.0.0.1:1880/#flow/8f4823599e012ecf">
              <b>Error flow</b>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
