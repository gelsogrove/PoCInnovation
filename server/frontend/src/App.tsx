import React, { useState } from "react"
import "./App.css"
import DefectsTable from "./components/DefectsTable"

const App: React.FC = () => {
  const [count] = useState<number>(0)

  return (
    <div className="App">
      <div className="container">
        <div>
          <h1>Workshop T11 - scratch detection on the car body</h1>
          <div className="defects-table-container">
            <DefectsTable />
          </div>
        </div>
        <div className="cards-container">
          <div className="card">
            <h2>Statistics</h2>
            Count: {count}
          </div>
          <div className="card">
            <h2>Settings</h2>
            <div className="settings-list">
              <div>
                <b>Status Active</b>

                <br />
                <br />
                <a href="http://127.0.0.1:1880/#flow/b56b851c180cbc4b">
                  <b>Pre detection flow</b>
                </a>

                <br />
                <a href="http://127.0.0.1:1880/#flow/56d7af57f34d08fb">
                  <b>Post detection flow</b>
                </a>

                <br />
                <a href="http://127.0.0.1:1880/#flow/8f4823599e012ecf">
                  <b>Error Flow</b>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
