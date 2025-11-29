
require('dotenv').config();
const { S3Client, ListObjectsV2Command, GetObjectCommand, ListBucketsCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({
  endpoint: process.env.B2_ENDPOINT || 'https://s3.eu-central-003.backblazeb2.com',
  region: process.env.B2_REGION || 'eu-central-003',
  credentials: {
    accessKeyId: process.env.B2_ACCESS_KEY_ID,
    secretAccessKey: process.env.B2_SECRET_ACCESS_KEY,
  },
});

async function testConnection() {
  console.log('Testing B2 Connection...');
  console.log('Endpoint env var:', process.env.B2_ENDPOINT);
  console.log('Region env var:', process.env.B2_REGION);
  console.log('B2_BUCKET_NAME env var:', process.env.B2_BUCKET_NAME);
  
  try {
    console.log('Listing buckets...');
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    console.log('Buckets:', response.Buckets.map(b => b.Name));
  } catch (error) {
    console.error('Error listing buckets:', error);
  }

  try {
    const bucketName = process.env.B2_BUCKET_NAME || 'Kotobpay';
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 1
    });
    
    const response = await s3Client.send(command);
    console.log('Successfully listed objects in bucket:', bucketName);
    if (response.Contents && response.Contents.length > 0) {
        console.log('Found object:', response.Contents[0].Key);
        
        // Try generating a signed URL for this object
        const getCommand = new GetObjectCommand({
            Bucket: bucketName,
            Key: response.Contents[0].Key
        });
        const url = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });
        console.log('Generated Signed URL:', url);
    } else {
        console.log('Bucket is empty or no objects found.');
    }

    console.log('Testing PutObject...');
    const uploadKey = `test-upload-${Date.now()}.txt`;
    try {
        await s3Client.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: uploadKey,
            Body: 'Test upload content',
            ContentType: 'text/plain'
        }));
        console.log('Successfully uploaded object:', uploadKey);
    } catch (uploadError) {
        console.error('Error uploading object:', uploadError);
    }

  } catch (error) {
    console.error('Error connecting to B2:', error);
  }
}

testConnection();
