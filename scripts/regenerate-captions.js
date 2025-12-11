import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const captionsPath = path.join(__dirname, '../public/data/captions.json');

console.log('🗑️  Regenerate AI Captions');
console.log('='.repeat(80));
console.log('');
console.log('This will delete the caption cache and force regeneration of all AI captions');
console.log('on the next run of process-photos.js');
console.log('');

if (fs.existsSync(captionsPath)) {
  const captions = JSON.parse(fs.readFileSync(captionsPath, 'utf8'));
  const count = Object.keys(captions).length;
  
  console.log(`Found ${count} cached captions`);
  console.log('');
  
  // Delete the file
  fs.unlinkSync(captionsPath);
  console.log('✅ Caption cache deleted!');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Run: node scripts/process-photos.js');
  console.log('  2. All photos will get fresh AI captions');
  console.log('');
} else {
  console.log('ℹ️  No caption cache found (already clean)');
  console.log('');
  console.log('Run: node scripts/process-photos.js to generate captions');
  console.log('');
}
