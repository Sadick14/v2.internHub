const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

// Create a simple PNG icon data URL (blue square with white IH text)
function createIconSVG(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${size/4}" fill="#3b82f6"/>
  <g transform="translate(${size/2}, ${size/2})">
    <path d="M${-size*0.3},${-size*0.1} L0,${-size*0.24} L${size*0.3},${-size*0.1} L${size*0.3},${size*0.04} L${size*0.26},${size*0.06} L${size*0.26},${-size*0.06} L0,${-size*0.16} L${-size*0.26},${-size*0.06} L${-size*0.26},${size*0.06} L${-size*0.3},${size*0.04} Z" 
          fill="#ffffff" stroke="#ffffff" stroke-width="${size*0.015}"/>
    <text x="0" y="${size*0.25}" font-family="Arial, sans-serif" font-size="${size*0.35}" font-weight="bold" 
          fill="#ffffff" text-anchor="middle" dominant-baseline="middle">IH</text>
  </g>
</svg>`;
}

console.log('Generating PWA icons...');

sizes.forEach(size => {
  const svg = createIconSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svg);
  console.log(`Created ${filename}`);
});

console.log('Icon generation complete!');
console.log('Note: For production, convert these SVGs to PNG using an image converter or design tool.');
