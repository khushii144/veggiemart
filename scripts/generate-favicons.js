const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const pngToIco = require('png-to-ico');

async function run() {
  const input = path.join(process.cwd(), 'public', 'logo.PNG');
  if (!fs.existsSync(input)) {
    console.error('Input logo not found at public/logo.PNG');
    process.exit(1);
  }

  const sizes = [16, 32, 48, 64, 96, 128, 180, 192, 256, 512];
  const outDir = path.join(process.cwd(), 'public');
  const pngFiles = [];

  for (const size of sizes) {
    const out = path.join(outDir, `favicon-${size}x${size}.png`);
    await sharp(input).resize(size, size, { fit: 'cover' }).toFile(out);
    pngFiles.push(out);
    console.log('Written', out);
  }

  // create favicon.ico from a subset of resized PNGs (recommended sizes)
  const icoSizes = [16, 32, 48, 64, 128, 256].map(s => path.join(outDir, `favicon-${s}x${s}.png`));
  try {
    const importer = await import('png-to-ico');
    const pngToIcoFn = importer.default || importer;
    const buf = await pngToIcoFn(icoSizes);
    const icoOut = path.join(outDir, 'favicon.ico');
    fs.writeFileSync(icoOut, buf);
    console.log('Written', icoOut);
  } catch (err) {
    console.error('Failed to write favicon.ico', err);
    // continue without exiting — PNG files are still useful
  }

  console.log('Favicons generation complete.');
}

run();
