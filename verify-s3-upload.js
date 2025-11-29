require('dotenv').config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  endpoint: process.env.B2_ENDPOINT || 'https://s3.eu-central-003.backblazeb2.com',
  region: process.env.B2_REGION || 'eu-central-003',
  credentials: {
    accessKeyId: process.env.B2_ACCESS_KEY_ID,
    secretAccessKey: process.env.B2_SECRET_ACCESS_KEY,
  },
});

async function main() {
  console.log('Testing S3 Upload...');
  try {
    const fileName = `test-upload-${Date.now()}.txt`;
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME || 'Taleempay',
      Key: fileName,
      Body: 'Test content',
      ContentType: 'text/plain',
    }));
    console.log('✅ Upload successful:', fileName);
  } catch (error) {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  }
}

main();
