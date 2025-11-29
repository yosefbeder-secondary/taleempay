
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  try {
    const count = await prisma.student.count({
      where: { gender: 'male' }
    });
    console.log(`Students with gender 'male': ${count}`);
    
    const sample = await prisma.student.findFirst();
    console.log('Sample student:', sample);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
