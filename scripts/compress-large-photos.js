import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PHOTOS_DIR = path.join(__dirname, '../public/photos');
const MAX_SIZE_MB = 4;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

// Check if ImageMagick is installed
function checkImageMagick() {
  try {
    execSync('magick --version', { stdio: 'ignore' });
    return true;
  } catch {
    console.log('❌ ImageMagick not found. Install it with: brew install imagemagick');
    return false;
  }
}

// Get file size in MB
function getFileSizeMB(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size / (1024 * 1024);
}

// Compress image
function compressImage(filePath) {
  const fileName = path.basename(filePath);
  const sizeBefore = getFileSizeMB(filePath);
  
  console.log(`\n📸 Compressing ${fileName} (${sizeBefore.toFixed(2)} MB)...`);
  
  // Create backup
  const backupPath = filePath + '.backup';
  fs.copyFileSync(filePath, backupPath);
  
  try {
    // Compress with quality 85 and max dimension 3840px (4K)
    execSync(
      `magick "${filePath}" -quality 85 -resize 3840x3840\\> "${filePath}"`,
      { stdio: 'inherit' }
    );
    
    const sizeAfter = getFileSizeMB(filePath);
    const reduction = ((sizeBefore - sizeAfter) / sizeBefore * 100).toFixed(1);
    
    console.log(`✅ Compressed to ${sizeAfter.toFixed(2)} MB (${reduction}% reduction)`);
    
    // Remove backup if successful
    fs.unlinkSync(backupPath);
    
    return true;
  } catch (error) {
    console.error(`❌ Failed to compress ${fileName}:`, error.message);
    // Restore backup
    fs.copyFileSync(backupPath, filePath);
    fs.unlinkSync(backupPath);
    return false;
  }
}

// Main function
async function main() {
  console.log('🔍 Checking for large images...\n');
  
  if (!checkImageMagick()) {
    process.exit(1);
  }
  
  const files = fs.readdirSync(PHOTOS_DIR);
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png)$/i.test(f));
  
  const largeFiles = [];
  
  for (const file of imageFiles) {
    const filePath = path.join(PHOTOS_DIR, file);
    const stats = fs.statSync(filePath);
    
    if (stats.size > MAX_SIZE_BYTES) {
      const sizeMB = stats.size / (1024 * 1024);
      largeFiles.push({ file, path: filePath, size: sizeMB });
    }
  }
  
  if (largeFiles.length === 0) {
    console.log(`✅ No images found over ${MAX_SIZE_MB}MB`);
    return;
  }
  
  console.log(`Found ${largeFiles.length} images over ${MAX_SIZE_MB}MB:\n`);
  largeFiles.forEach(({ file, size }) => {
    console.log(`  📸 ${file}: ${size.toFixed(2)} MB`);
  });
  
  console.log('\n🔄 Starting compression...');
  
  let successful = 0;
  let failed = 0;
  
  for (const { path: filePath } of largeFiles) {
    if (compressImage(filePath)) {
      successful++;
    } else {
      failed++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Successfully compressed: ${successful}`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed}`);
  }
  console.log('='.repeat(50));
}

main().catch(console.error);
