import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const photosPath = path.join(__dirname, '../public/data/photos.json');
const captionsPath = path.join(__dirname, '../public/data/captions.json');

// Read and parse photos.json
const photos = JSON.parse(fs.readFileSync(photosPath, 'utf8'));

// Try to read captions.json if it exists
let captions = {};
if (fs.existsSync(captionsPath)) {
  captions = JSON.parse(fs.readFileSync(captionsPath, 'utf8'));
}

console.log('\n📸 Photo Search Descriptions (AI + Manual)\n');
console.log('='.repeat(80));

// Import the generateDescription function
// (We'll recreate it here since we can't easily import from the other file)

function generateDescription(photo) {
  const parts = [];
  const filename = photo.id.toLowerCase();
  
  // Use same logic as process-photos.js
  // PRIORITY 1: Manual override - if replaceAI is true, use ONLY manual tags
  const manualTags = photo.manualTags || [];
  const replaceAI = photo.replaceAI || false;
  const aiTags = photo.aiTags || [];
  
  if (replaceAI && manualTags.length > 0) {
    parts.push(manualTags.join(' '));
    parts.push(manualTags.join(' '));
    parts.push(manualTags.join(' '));
    
    if (photo.location?.country) {
      parts.push(`${photo.location.country}`);
    }
    return parts.join(' ');
  }
  
  // PRIORITY 2: AI Tags from CLIP
  if (aiTags.length > 0) {
    const aiTagsStr = aiTags.join(' ');
    parts.push(aiTagsStr);
    parts.push(aiTagsStr);
  }
  
  // PRIORITY 3: Manual supplement tags
  if (manualTags.length > 0) {
    parts.push(manualTags.join(' '));
    parts.push(manualTags.join(' '));
  }

  // PRIORITY 4: Metadata context (minimal weight)
  // Only add location and device context - let CLIP handle time/lighting detection
  const aiTagsLower = aiTags.map(t => t.toLowerCase());
  
  if (photo.location?.country) {
    parts.push(`${photo.location.country}`);
  }

  const isDrone = photo.camera?.includes('FC') || photo.camera?.includes('DJI') || filename.includes('dji');
  if (isDrone && !aiTagsLower.includes('aerial view')) {
    parts.push('aerial drone photography');
  }

  if (photo.trip === 'Scandinavia 2025') {
    parts.push('Scandinavia travel');
  }

  return parts.join(' ');
}

// Display each photo's searchable description
photos.forEach((photo, index) => {
  const description = generateDescription(photo);
  const hasManual = photo.hasManualOverride || false;
  const aiCaption = captions[photo.id]?.aiCaption || photo.aiCaption || 'No AI caption';
  const manualTags = photo.manualTags || [];
  const replaceAI = photo.replaceAI || false;

  console.log(`\n${index + 1}. ${photo.id} ${hasManual ? '[MANUAL]' : '[AUTO]'}`);
  console.log(`   Camera: ${photo.camera || 'Unknown'}`);
  console.log(`   Location: ${photo.location?.country || 'Unknown'}`);
  console.log(`   Date: ${photo.date ? new Date(photo.date).toLocaleString() : 'Unknown'}`);
  console.log('');
  
  // Show AI caption
  console.log(`   🤖 AI Caption:`);
  console.log(`      "${aiCaption}"`);
  
  // Show manual tags if any
  if (manualTags.length > 0) {
    console.log('');
    console.log(`   ✍️  Manual Tags (${replaceAI ? 'REPLACES AI' : 'supplements AI'}):`);
    console.log(`      [${manualTags.join(', ')}]`);
  }
  
  // Show final merged description
  console.log('');
  console.log(`   📝 Final Search Description:`);
  console.log(`      "${description}"`);
  console.log('-'.repeat(80));
});

const photosWithManual = photos.filter(p => p.hasManualOverride).length;
const photosWithAI = photos.filter(p => p.aiCaption && p.aiCaption.trim()).length;

console.log(`\n✅ Total: ${photos.length} photos`);
console.log(`🤖 AI Captions: ${photosWithAI} photos`);
console.log(`✍️  Manual Overrides: ${photosWithManual} photos`);
console.log('');
