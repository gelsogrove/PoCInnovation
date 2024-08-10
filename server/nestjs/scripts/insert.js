// insertRecord.js

const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function main() {
  // Inserisci un record nella tabella User
  const newUser = await prisma.user.create({
    data: {
      email: "example@example.com",
      name: "John Doe",
    },
  })
  console.log("New User:", newUser)

  // Inserisci un record nella tabella Event
  const newEvent = await prisma.event.create({
    data: {
      dateFormat: new Date(),
      timestamp: Math.floor(Date.now() / 1000),
      workshop: "Workshop Example",
      camera: "Camera Example",
      imageBase64: "Base64EncodedImageString",
      file: "exampleFile.txt",
    },
  })
  console.log("New Event:", newEvent)
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
