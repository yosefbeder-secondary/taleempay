const sharp = require('sharp');

async function main() {
  console.log('Testing Sharp...');
  try {
    // Create a simple 100x100 red image
    const buffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 1 }
      }
    })
    .png()
    .toBuffer();

    console.log('✅ Created initial buffer');

    // Try to resize and convert to JPEG (same logic as createOrder)
    const optimizedBuffer = await sharp(buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    console.log('✅ Sharp processing successful. Output size:', optimizedBuffer.length);
  } catch (error) {
    console.error('❌ Sharp failed:', error);
    process.exit(1);
  }
}

main();
