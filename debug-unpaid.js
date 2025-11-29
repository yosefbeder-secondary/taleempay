const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function debugUnpaid() {
  try {
    const book = await prisma.book.findFirst({
      include: { orders: true }
    })

    if (!book) {
      console.log('No book found')
      return
    }

    console.log(`Book: ${book.name} (Class ${book.classId})`)
    console.log(`Total Orders: ${book.orders.length}`)

    const paidOrders = book.orders.filter(o => o.status === 'PAID' || o.status === 'DELIVERED')
    console.log(`Paid/Delivered Orders: ${paidOrders.length}`)

    const paidStudentIds = new Set(paidOrders.map(o => o.studentId))
    
    const allStudents = await prisma.student.findMany({
      where: { classId: book.classId }
    })
    console.log(`Total Students in Class ${book.classId}: ${allStudents.length}`)

    const unpaidStudentsList = allStudents.filter(s => !paidStudentIds.has(s.id))
    console.log(`Calculated Unpaid Students: ${unpaidStudentsList.length}`)
    
    // Check if there are students in other classes
    const totalStudents = await prisma.student.count()
    console.log(`Total Students in DB (all classes): ${totalStudents}`)

  } catch (error) {
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

debugUnpaid()
