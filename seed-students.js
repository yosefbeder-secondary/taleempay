const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const path = require('path');

const prisma = new PrismaClient();
const filePath = path.join(__dirname, 'قوائم الطلاب طب بنين 2026-2.xlsx');

const sheetToClassId = {
  'اولى': 1,
  'ثانية': 2,
  'ثالثة': 3,
  'رابعة ': 4,
  'خامسة ': 5
};

async function main() {
  try {
    const workbook = XLSX.readFile(filePath);
    
    for (const [sheetName, classId] of Object.entries(sheetToClassId)) {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) {
        console.log(`Sheet ${sheetName} not found, skipping.`);
        continue;
      }
      
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      // Header is at index 6, data starts at index 7
      const rows = data.slice(7);
      
      console.log(`Seeding ${sheetName} (Class ${classId})... Found ${rows.length} rows.`);
      
      let count = 0;
      for (const row of rows) {
        const settingId = row[1]; // رقم الجلوس
        const name = row[4]; // اسم الطالب
        
        if (!settingId || !name) continue;
        
        await prisma.student.upsert({
          where: { settingId: String(settingId) },
          update: {
            name: String(name).trim(),
            classId: classId
          },
          create: {
            name: String(name).trim(),
            settingId: String(settingId),
            classId: classId
          }
        });
        count++;
      }
      console.log(`Processed ${count} students for ${sheetName}.`);
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
