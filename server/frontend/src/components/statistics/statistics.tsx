/* eslint-disable jsx-a11y/alt-text */
import React from "react"
import DefectModel from "../../models/DefectModel"

interface StatisticsProps {
  defects: DefectModel[]
}

const Statistics: React.FC<StatisticsProps> = (props) => {
  const { defects } = props

  return (
    <div className="card">
      <h2>Statistics</h2>
      <hr />
      <h3>Count: {defects.length}</h3>
      <br />
      <img
        width="500"
        height="180"
        src="https://datavizcatalogue.com/methods/images/top_images/area_graph.png"
      />
    </div>
  )
}

export default Statistics
