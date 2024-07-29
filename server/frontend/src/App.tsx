import React from "react"
import "./App.css"
import DefectsTable from "./components/DefectsTable"

const App: React.FC = () => {
  return (
    <div className="App">
      <div className="container">
        <div className="title-container"></div>
        <div>
          <h1>Defects Table</h1>
          <div className="defects-table-container">
            <DefectsTable />
          </div>
        </div>
        <div className="cards-container">
          <div className="card">
            <h2>Card 1</h2>
            {/* Contenuto futuro */}
          </div>
          <div className="card">
            <h2>Card 2</h2>
            {/* Contenuto futuro */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
