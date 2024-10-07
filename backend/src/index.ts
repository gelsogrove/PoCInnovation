import express, { Request, Response } from "express"
import fs from "fs"
import http from "http"
import path from "path"
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

app.post("/new-defect", (req: Request, res: Response) => {
  const { dateFormat, timestamp, workshop, _msgId, camera, imageBase64, file } =
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
  const imagePath = path.join(imagesDirPath, `${file}`)

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

    // Add a new entry if the last entry does not contain VIN
    if (!file.toLowerCase().includes("vin")) {
      jsonData.push({
        _msgId,
        data: date.toISOString(),
        filepath: `images/${file}`,
        workshop,
        camera,
        vin: null,
      })
    } else {
      let lastEntry = jsonData[jsonData.length - 1]

      jsonData[jsonData.length - 1] = {
        ...lastEntry,
        vin: `images/${file}`,
      }
    }

    const fileContent = JSON.stringify(jsonData, null, 2)

    fs.writeFile(filePath, fileContent, (err) => {
      if (err) {
        console.error("Error saving the file:", err)
        return res.status(500).json({ error: "Error saving the file" })
      }

      res.json({ message: "File saved/updated successfully" })
    })
  })
})

app.delete("/delete-defect", (req: Request, res: Response) => {
  const { workshop, _msgId } = req.query

  if (!workshop || !_msgId) {
    return res.status(400).json({ error: "workshop and _msgId are required" })
  }

  const dirPath = path.join(__dirname, "data")
  const filePath = path.join(dirPath, `${workshop}.json`)

  fs.readFile(filePath, "utf8", (err, fileData) => {
    if (err) {
      console.error("Error reading the file:", err)
      return res.status(500).json({ error: "Error reading the file" })
    }

    let jsonData: any[] = []

    try {
      jsonData = JSON.parse(fileData)
    } catch (parseErr) {
      console.error("Error parsing file data:", parseErr)
      return res.status(500).json({ error: "Error parsing file data" })
    }

    const updatedData = jsonData.filter((entry) => entry._msgId !== _msgId)

    if (updatedData.length === jsonData.length) {
      return res.status(404).json({ error: "Entry not found" })
    }

    const fileContent = JSON.stringify(updatedData, null, 2)

    fs.writeFile(filePath, fileContent, (err) => {
      if (err) {
        console.error("Error saving the file:", err)
        return res.status(500).json({ error: "Error saving the file" })
      }

      res.json({ message: "File updated successfully" })
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

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
