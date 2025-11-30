require('dotenv').config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function main() {
  console.log('Testing S3 Upload...');
  try {
    const fileName = `test-upload-${Date.now()}.txt`;
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || 'taleempay',
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
