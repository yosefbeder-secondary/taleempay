
import * as XLSX from 'xlsx';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'قوائم الطلاب طب بنين 2026-2.xlsx');

try {
  const workbook = XLSX.readFile(filePath);
  const sheetNames = workbook.SheetNames;
  console.log('All Sheet Names:', sheetNames);
  
  // Inspect first few rows of the second sheet if it exists
  if (sheetNames.length > 1) {
    const sheet = workbook.Sheets['ثانية'];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    
    console.log('Searching for header row...');
    for (let i = 0; i < 20; i++) {
      const row = data[i];
      if (row) {
        console.log(`Row ${i}:`, JSON.stringify(row));
        if (JSON.stringify(row).includes('الجلوس')) {
          console.log(`FOUND "الجلوس" in Row ${i}!`);
        }
      }
    }
  }
} catch (error) {
  console.error('Error reading file:', error);
}
