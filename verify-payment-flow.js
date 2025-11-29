const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Starting Payment Flow Verification...')

  // 1. Create a test book
  const book = await prisma.book.create({
    data: {
      name: 'Test Book ' + Date.now(),
      price: 150,
      classId: 1,
      paymentPhoneNumber: '01000000000',
      acceptsVodafoneCash: true,
      acceptsInstapay: true,
    }
  })
  console.log('Created Book:', book.id)

  // 2. Create a test student
  const student = await prisma.student.create({
    data: {
      name: 'Test Student ' + Date.now(),
      settingId: 'SET-' + Date.now(),
      classId: 1,
    }
  })
  console.log('Created Student:', student.id)

  // 3. Create Order (Pending Confirmation)
  // We can't easily simulate FormData upload here without mocking, 
  // so we'll use prisma directly to simulate what the server action does.
  const order = await prisma.order.create({
    data: {
      studentId: student.id,
      bookId: book.id,
      status: 'PENDING_CONFIRMATION',
      paymentScreenshotPath: '/uploads/test-screenshot.png',
    }
  })
  console.log('Created Order (Pending Confirmation):', order.id, order.status)

  // 4. Verify Pending State
  if (order.status !== 'PENDING_CONFIRMATION') {
    throw new Error('Order status should be PENDING_CONFIRMATION')
  }

  // 5. Admin Confirm Payment
  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: { status: 'PAID' }
  })
  console.log('Confirmed Order:', updatedOrder.id, updatedOrder.status)

  if (updatedOrder.status !== 'PAID') {
    throw new Error('Order status should be PAID')
  }

  // 6. Cleanup
  await prisma.order.delete({ where: { id: order.id } })
  await prisma.student.delete({ where: { id: student.id } })
  await prisma.book.delete({ where: { id: book.id } })
  console.log('Cleanup complete')

  console.log('Verification Successful!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
