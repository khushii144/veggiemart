const fs = require('fs');
const path = require('path');
const https = require('https');

const urls = [
  'https://png.pngtree.com/thumb_back/fh260/background/20240720/pngtree-a-vibrant-mix-of-fresh-produce-including-colorful-vegetables-and-fruits-image_16017533.jpg',
  'https://media.gettyimages.com/id/2148517716/photo/assortment-of-fresh-colorful-organic-vegetables-on-wooden-pine-table-healthy-food-background.jpg?s=612x612&w=0&k=20&c=cOd6RbVoFtgxuW7ev2UWnEpvx7xGUIrMmA8yXCV_2A4=',
  'https://media.gettyimages.com/id/1266720692/photo/bio-food-garden-produce-and-harvested-vegetable-fresh-farm-vegetables-in-wooden-box-carrots.jpg?s=612x612&w=0&k=20&c=9FBPXDkY50XAoXJUPtClXtqZm9-e2fD7utttSCrU74c='
];

const targetDir = path.join(process.cwd(), 'public', 'images');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(path.join(targetDir, filename));
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: status ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${filename} successfully.`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(path.join(targetDir, filename), () => {});
      reject(err);
    });
  });
}

async function downloadAll() {
  try {
    await downloadImage(urls[0], 'banner2.jpg');
    await downloadImage(urls[1], 'banner3.jpg');
    await downloadImage(urls[2], 'banner4.jpg');
    console.log('All images downloaded successfully.');
  } catch (error) {
    console.error('Error downloading images:', error);
  }
}

downloadAll();
