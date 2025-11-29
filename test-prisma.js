const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const books = await prisma.book.findMany()
    console.log('Books:', books)
    
    const book = await prisma.book.findFirst()
    console.log('Book ID:', book?.id)
  } catch (e) {
    console.error('Error:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
