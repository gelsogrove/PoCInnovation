import React, { useState } from "react"
import { Bar } from "react-chartjs-2"
import Modal from "react-modal"
import "../customModal/CustomModal.css" // Assicurati che il percorso sia corretto
import "./statistics.css" // Assicurati che il percorso sia corretto

// Import dei moduli necessari per Chart.js
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

Modal.setAppElement("#root")

interface StatisticsProps {
  defects: { data: string }[]
}

const Statistics: React.FC<StatisticsProps> = ({ defects }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalData, setModalData] = useState<any>(null)

  const getHourFromDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.getHours()
  }

  const hourCounts: { [key: number]: number } = {}
  defects.forEach((defect) => {
    const hour = getHourFromDate(defect.data)
    hourCounts[hour] = (hourCounts[hour] || 0) + 1
  })

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const counts = hours.map((hour) => hourCounts[hour] || 0)

  const data = {
    labels: hours.map((hour) => `${hour}:00`),
    datasets: [
      {
        label: "Errors per Hour",
        data: counts,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.label}: ${context.raw} errors`
          },
        },
      },
    },
    onClick: () => {
      setModalData(data)
      setIsModalOpen(true)
    },
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setModalData(null)
  }

  return (
    <div className="card">
      <h2>Statistics</h2>

      <div
        className="chart-container"
        style={{ position: "relative", height: "400px" }}
      >
        <Bar data={data} options={options} />
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Detailed Error Stats"
        className="Modal"
        overlayClassName="Overlay"
      >
        <div
          className="chart-container"
          style={{ position: "relative", height: "500px", width: "800px" }}
        >
          {modalData ? (
            <Bar data={modalData} options={options} />
          ) : (
            <p>Loading...</p>
          )}
        </div>
        <button onClick={closeModal} className="close-button">
          Close
        </button>
      </Modal>
    </div>
  )
}

export default Statistics
