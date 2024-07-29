import React, { useState } from "react"
import "./App.css"
import DefectsTable from "./components/defect-table/DefectsTable"
import Settings from "./components/settings/settings"
import Statistics from "./components/statistics/statistics"

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
          <Statistics />
          <Settings />
        </div>
      </div>
    </div>
  )
}

export default App
