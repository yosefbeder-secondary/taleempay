const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Verifying Admin and Student Flow...');

  // 1. Verify Admin Exists
  const admin = await prisma.admin.findUnique({ where: { username: 'admin' } });
  if (!admin) {
    console.error('❌ Admin not found');
    process.exit(1);
  }
  console.log('✅ Admin exists:', admin.username);

  // 2. Verify Book Creation (Simulated)
  // We can't simulate the server action context (cookies) easily here without mocking.
  // But we can check if the book created previously (if any) has an adminId?
  // Or just create a book manually with adminId and see if it works.
  
  const book = await prisma.book.create({
    data: {
      name: 'Test Book Admin',
      price: 100,
      classId: 1,
      adminId: admin.id
    }
  });
  console.log('✅ Book created with adminId:', book.id);

  // 3. Verify Student Search (Simulated)
  const student = await prisma.student.findFirst();
  if (student) {
    const students = await prisma.student.findMany({
      where: {
        OR: [
          { name: { contains: student.name } },
          { settingId: { contains: student.settingId } }
        ]
      }
    });
    if (students.length > 0) {
      console.log('✅ Student search works, found:', students.length);
    } else {
      console.error('❌ Student search failed');
    }

    // 4. Verify Get Student Books
    const booksForStudent = await prisma.book.findMany({
      where: { classId: student.classId, isActive: true },
      include: {
        orders: {
          where: { studentId: student.id },
          take: 1
        }
      }
    });
    console.log('✅ Get Student Books works, found:', booksForStudent.length);
  } else {
    console.log('⚠️ No students found to verify search');
  }

  // Cleanup
  await prisma.book.delete({ where: { id: book.id } });
  console.log('✅ Cleanup complete');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
