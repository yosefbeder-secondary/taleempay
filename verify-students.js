const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Listing Students...');
  const students = await prisma.student.findMany({ take: 5 });
  console.log(`Found ${students.length} students.`);
  students.forEach(s => console.log(`- ${s.name} (${s.id})`));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
