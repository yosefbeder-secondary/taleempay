const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'قوائم الطلاب طب بنين 2026-2.xlsx');

try {
  const workbook = XLSX.readFile(filePath);
  const sheetNames = workbook.SheetNames;
  
  console.log('Sheets:', sheetNames);

  const sheetName = sheetNames[0]; // Check first sheet 'اولى'
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
  console.log(`\nSheet: ${sheetName}`);
  console.log('First 10 rows:');
  data.slice(0, 10).forEach((row, index) => {
    console.log(`Row ${index}:`, row);
  });

} catch (error) {
  console.error('Error reading file:', error);
}
