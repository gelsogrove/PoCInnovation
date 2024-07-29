import express, { Request, Response } from "express"
import fs from "fs"
import http from "http"
import path from "path"
import WebSocket, { Server as WebSocketServer } from "ws"
const cors = require("cors")

const app = express()
const PORT = process.env.PORT || 3000

// Middleware to parse JSON and URL-encoded data with increased limit
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))

// Enable CORS for all origins
app.use(cors())

// Serve static files from the 'images' directory
const imagesPath = path.join(__dirname, "images")
app.use("/images", express.static(imagesPath))

// Function to validate date
const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

// Create HTTP server
const server = http.createServer(app)

// Create WebSocket server
const wss = new WebSocketServer({ server })

wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected via WebSocket")

  ws.on("message", (message: WebSocket.MessageEvent) => {
    console.log(`Received message: ${message}`)
  })

  ws.on("close", (code: number, reason: Buffer) => {
    console.log(
      `WebSocket connection closed. Code: ${code}, Reason: ${reason.toString()}`
    )
  })

  ws.on("error", (error: Error) => {
    console.error("WebSocket error:", error)
  })
})

// Function to send WebSocket messages
const sendWebSocketMessage = (message: string) => {
  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  })
}

app.post("/new-defect", (req: Request, res: Response) => {
  const { dateFormat, timestamp, workshop, _msgId, camera, imageBase64 } =
    req.body

  if (!dateFormat || !timestamp) {
    return res
      .status(400)
      .json({ error: "dateFormat and timestamp are required" })
  }

  if (!isValidDate(dateFormat)) {
    return res.status(400).json({ error: "Invalid date value" })
  }

  const date = new Date(dateFormat)
  const imagesDirPath = path.join(__dirname, "images")
  const imagePath = path.join(imagesDirPath, `${timestamp}.jpg`)

  if (!fs.existsSync(imagesDirPath)) {
    fs.mkdirSync(imagesDirPath, { recursive: true })
  }

  const imageBuffer = Buffer.from(imageBase64, "base64")
  fs.writeFileSync(imagePath, imageBuffer)

  const dirPath = path.join(__dirname, "data")
  const filePath = path.join(dirPath, `${workshop}.json`)

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }

  fs.readFile(filePath, "utf8", (err, fileData) => {
    let jsonData: any[] = []

    if (!err && fileData) {
      try {
        jsonData = JSON.parse(fileData)
      } catch (parseErr) {
        console.error("Error parsing existing file data:", parseErr)
        return res
          .status(500)
          .json({ error: "Error parsing existing file data" })
      }
    }

    jsonData.push({
      _msgId,
      data: date.toISOString(),
      filepath: `images/${timestamp}.jpg`,
      workshop,
      camera,
    })

    const fileContent = JSON.stringify(jsonData, null, 2)

    fs.writeFile(filePath, fileContent, (err) => {
      if (err) {
        console.error("Error saving the file:", err)
        return res.status(500).json({ error: "Error saving the file" })
      }

      sendWebSocketMessage("refresh")
      res.json({ message: "File saved successfully" })
    })
  })
})

app.get("/defects", (req: Request, res: Response) => {
  const { workshop } = req.query

  if (!workshop) {
    return res.status(400).json({ error: "workshopId is required" })
  }

  const dirPath = path.join(__dirname, "data")
  const filePath = path.join(dirPath, `${workshop}.json`)

  fs.readFile(filePath, "utf8", (err, fileData) => {
    if (err) {
      console.error("Error reading the file:", err)
      return res.status(500).json({ error: "Error reading the file" })
    }

    try {
      const jsonData = JSON.parse(fileData)
      res.json(jsonData)
    } catch (parseErr) {
      console.error("Error parsing file data:", parseErr)
      res.status(500).json({ error: "Error parsing file data" })
    }
  })
})

// Start the HTTP and WebSocket server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
