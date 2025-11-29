import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const firstNames = ["Mohamed", "Ahmed", "Mahmoud", "Yosef", "Sarah", "Fatma", "Omar", "Ali", "Hassan", "Khaled", "Nour", "Mariam", "Aya", "Heba", "Mostafa"]
const lastNames = ["Ahmed", "Mohamed", "Mahmoud", "Ali", "Hassan", "Ibrahim", "Sayed", "Abdallah", "Beder", "Salah", "Kamel", "Fawzy", "Nabil", "Samir", "Adel"]

function getRandomName() {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)]
  const last = lastNames[Math.floor(Math.random() * lastNames.length)]
  return `${first} ${last}`
}

async function main() {
  console.log('Start seeding ...')

  // Create Book for Class 1
  const book = await prisma.book.create({
    data: {
      name: 'Pathology 101',
      price: 250.0,
      isActive: true,
      classId: 1,
    },
  })
  console.log(`Created book: ${book.name} for Class 1`)

  // Create Students for Class 1 (2026001 - 2026300)
  const class1Students = []
  for (let i = 1; i <= 300; i++) {
    const settingId = `2026${i.toString().padStart(3, '0')}`
    class1Students.push({
      name: getRandomName(),
      settingId: settingId,
      classId: 1,
    })
  }

  // Create Students for Class 2 (2026301 - 2026600)
  const class2Students = []
  for (let i = 301; i <= 600; i++) {
    const settingId = `2026${i.toString().padStart(3, '0')}`
    class2Students.push({
      name: getRandomName(),
      settingId: settingId,
      classId: 2,
    })
  }

  const allStudents = [...class1Students, ...class2Students]

  // Batch create students
  await prisma.student.createMany({
    data: allStudents,
  })

  console.log(`Created ${allStudents.length} students`)
  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
