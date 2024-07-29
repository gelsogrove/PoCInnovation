import express, { Request, Response } from "express"
import fs from "fs"
import path from "path"
const cors = require("cors")

const app = express()
const PORT = process.env.PORT || 3000

// Middleware to parse JSON and URL-encoded data with increased limit
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))

// Abilita CORS per tutte le origini
app.use(cors())

// Serve static files from the 'images' directory
const imagesPath = path.join(__dirname, "images")
app.use("/images", express.static(imagesPath))

// Function to validate date
const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

app.post("/new-defect", (req: Request, res: Response) => {
  const { dateFormat, timestamp, workshop, _msgId, camera, imageBase64 } =
    req.body

  if (!dateFormat || !timestamp) {
    return res.status(400).json({
      error: "dateFormat and timestamp are required",
    })
  }

  // Check if 'dateFormat' is a valid date
  if (!isValidDate(dateFormat)) {
    return res.status(400).json({ error: "Invalid date value" })
  }

  const date = new Date(dateFormat)

  const imagesDirPath = path.join(__dirname, "images")
  const imagePath = path.join(imagesDirPath, `${timestamp}.jpg`)

  // Create the images directory if it doesn't exist
  if (!fs.existsSync(imagesDirPath)) {
    fs.mkdirSync(imagesDirPath, { recursive: true })
  }

  // Decode base64 image and save it as a binary file
  const imageBuffer = Buffer.from(imageBase64, "base64")
  fs.writeFileSync(imagePath, imageBuffer)

  const dirPath = path.join(__dirname, "data")
  const filePath = path.join(dirPath, `${workshop}.json`)

  // Create the data directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }

  // Read existing content of the file
  fs.readFile(filePath, "utf8", (err, fileData) => {
    let jsonData = []

    if (!err && fileData) {
      try {
        jsonData = JSON.parse(fileData)
      } catch (parseErr) {
        return res
          .status(500)
          .json({ error: "Error parsing existing file data" })
      }
    }

    // Add the new object to the existing content
    jsonData.push({
      _msgId,
      data: date.toISOString(), // Use the validated date value
      filepath: `images/${timestamp}.jpg`, // Relative path
      workshop,
      camera,
    })

    const fileContent = JSON.stringify(jsonData, null, 2)

    // Write the content to the file
    fs.writeFile(filePath, fileContent, (err) => {
      if (err) {
        return res.status(500).json({ error: "Error saving the file" })
      }
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
      return res
        .status(500)
        .json({ error: "Error reading the file" + filePath })
    }
    try {
      const jsonData = JSON.parse(fileData)
      res.json(jsonData)
    } catch (parseErr) {
      res.status(500).json({ error: "Error parsing file data" })
    }
  })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
