import React from "react"
import "./App.css"
import DefectsTable from "./components/DefectsTable"

const App: React.FC = () => {
  return (
    <div className="App">
      <div className="container">
        <div className="title-container"></div>
        <div>
          <h1>Workshop T11 - scratch detection on the car body</h1>
          <div className="defects-table-container">
            <DefectsTable />
          </div>
        </div>
        <div className="cards-container">
          <div className="card">
            <h2>Settings</h2>
            {/* Contenuto futuro */}
          </div>
          <div className="card">
            <h2>Graph</h2>
            {/* Contenuto futuro */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
