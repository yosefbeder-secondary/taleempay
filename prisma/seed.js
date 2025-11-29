const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const names = [
  "أحمد", "محمد", "محمود", "علي", "حسن", "إبراهيم", "سيد", "عبدالله", "بدر", "صلاح",
  "كامل", "فوزي", "نبيل", "سمير", "عادل", "يوسف", "عمر", "خالد", "مصطفى", "حسين"
]

function getRandomName() {
  const parts = []
  for (let i = 0; i < 5; i++) {
    parts.push(names[Math.floor(Math.random() * names.length)])
  }
  return parts.join(" ")
}

async function main() {
  console.log('Start seeding ...')

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
  try {
    // SQLite doesn't support createMany in this version/config sometimes, so we use Promise.all
    // But for 600 items, let's try to batch them in chunks if possible or just loop.
    // Using Promise.all for 600 items might be okay for local dev.
    
    // Let's use a transaction or just loop.
    console.log(`Creating ${allStudents.length} students...`)
    
    // Chunking to avoid too many concurrent connections/promises if that was an issue
    const chunkSize = 50;
    for (let i = 0; i < allStudents.length; i += chunkSize) {
        const chunk = allStudents.slice(i, i + chunkSize);
        await Promise.all(chunk.map(student => prisma.student.create({ data: student })));
    }
    
    console.log(`Created ${allStudents.length} students`)
  } catch (e) {
    console.log('Students might already exist or error:', e.message)
  }

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
