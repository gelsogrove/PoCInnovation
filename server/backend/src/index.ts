import express, { Request, Response } from "express"
import fs from "fs"
import path from "path"

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json()) // Middleware to parse JSON
app.use(express.urlencoded({ extended: true })) // Middleware to parse URL-encoded data

app.post("/new-defect", (req: Request, res: Response) => {
  const {
    data,
    filename,
    workshop,
    workshopId,
    _msgId,
    camera,
    cameraId,
    imageBase64,
  } = req.body

  if (
    !data ||
    !filename ||
    !workshop ||
    !workshopId ||
    !_msgId ||
    !camera ||
    !cameraId ||
    !imageBase64
  ) {
    return res.status(400).json({
      error:
        "data, filename, workshop, workshopId, _msgId, camera, cameraId, and imageBase64 are required",
    })
  }

  const imagesDirPath = path.join(__dirname, "images")
  const imagePath = path.join(imagesDirPath, filename)

  // Decode base64 image and save it
  const imageBuffer = Buffer.from(imageBase64, "base64")
  fs.writeFileSync(imagePath, imageBuffer)

  const dirPath = path.join(__dirname, "data")
  const filePath = path.join(dirPath, `${workshopId}.json`)

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
      data: new Date(data).toISOString(),
      filepath: imagePath,
      workshop,
      workshopId,
      camera,
      cameraId,
    })

    const fileContent = JSON.stringify(jsonData, null, 2)

    // Write the updated content to the file
    fs.writeFile(filePath, fileContent, (err) => {
      if (err) {
        return res.status(500).json({ error: "Error saving the file" })
      }
      res.json({ message: "File saved successfully" })
    })
  })
})

app.get("/defects", (req: Request, res: Response) => {
  const { workshopId } = req.query

  if (!workshopId) {
    return res.status(400).json({ error: "workshopId is required" })
  }

  const dirPath = path.join(__dirname, "data")
  const filePath = path.join(dirPath, `${workshopId}.json`)

  fs.readFile(filePath, "utf8", (err, fileData) => {
    if (err) {
      return res.status(500).json({ error: "Error reading the file" })
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
