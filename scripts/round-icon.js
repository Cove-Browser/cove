const fs = require('fs');
const path = require('path');

// Read the PNG file
const inputPath = path.join(__dirname, '../icon-256.png');
const outputPath = path.join(__dirname, '../icon-256.png');

// Use sharp if available, otherwise use canvas
try {
  const sharp = require('sharp');
  const size = 256;
  const radius = 58; // ~22.5% of 256px, standard macOS/Windows rounded icon

  const roundedCorners = Buffer.from(
    `<svg><rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}"/></svg>` 
  );

  sharp(inputPath)
    .resize(size, size)
    .composite([{ input: roundedCorners, blend: 'dest-in' }])
    .png()
    .toFile(outputPath.replace('.png', '-rounded.png'))
    .then(() => console.log('Icon rounded successfully → icon-256-rounded.png'))
    .catch(err => console.error('Error:', err));
} catch (e) {
  console.log('sharp not installed. Run: npm install sharp --save-dev then node scripts/round-icon.js');
}
