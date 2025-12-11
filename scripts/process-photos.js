import exifr from 'exifr';
import { pipeline } from '@xenova/transformers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MANUAL OVERRIDES for AI-generated captions
// Use this to supplement or replace AI captions when needed
// 
// Structure:
// 'photoId': {
//   tags: ['additional', 'descriptive', 'keywords'],  // Extra tags to add
//   replaceAI: false,  // Set true to completely replace AI caption
//   supplement: true   // Set true to combine AI + manual tags (default)
// }
//
// Best practices:
// - Use supplement: true (default) when AI is correct but needs more detail
// - Use replaceAI: true only when AI completely misidentifies the subject
// - Add specific details AI might miss: proper nouns, emotions, artistic style, etc.
// Optional manual overrides for specific photos
const MANUAL_OVERRIDES = {
  // Add manual overrides here if needed
  // Example:
  // 'photo.jpg': {
  //   tags: ['custom', 'tags'],
  //   replaceAI: true  // true = replace AI completely, false = supplement
  // }
};

// CLIP-based image classification categories
// Using a balanced set that's specific enough to be useful but not so granular that scores get too diluted
const CLIP_CATEGORIES = [
  // Water Vessels
  'boat', 'canoe', 'kayak', 'ship', 'vessel', 'sailboat', 'yacht',
  'fishing boat', 'paddle', 'oar',

  // Animals & Wildlife
  'bird', 'seagull', 'pelican', 'duck', 'eagle',
  'animal', 'dog', 'cat', 'horse', 'deer', 'wildlife', 'fish',

  // People & Activities
  'person', 'people', 'human', 'crowd', 'group',
  'walking', 'running', 'sitting', 'standing', 'swimming', 'surfing', 'kayaking',
  'hiking', 'cycling', 'fishing', 'relaxing',

  // Vehicles
  'car', 'vehicle', 'truck', 'bus', 'van', 'bicycle', 'motorcycle', 'scooter',
  'airplane', 'helicopter', 'hot air balloon', 'drone',

  // Architecture & Structures
  'building', 'house', 'cabin', 'skyscraper', 'tower',
  'architecture', 'bridge', 'monument', 'statue', 'fountain',
  'lighthouse', 'barn', 'church', 'temple',
  'pier', 'dock', 'wharf', 'boardwalk', 'jetty', 'marina',
  'fence', 'pathway', 'stairs',

  // Urban Elements
  'sign', 'signpost', 'billboard', 'traffic light', 'street light', 'lamp post',
  'bench', 'trash can', 'mailbox', 'fire hydrant',

  // Furniture & Objects
  'furniture', 'chair', 'table', 'umbrella', 'tent', 'hammock',
  'camera', 'tripod', 'backpack', 'bag',

  // Nature - Vegetation
  'tree', 'trees', 'pine tree', 'palm tree',
  'forest', 'woods',
  'plant', 'flower', 'flowers', 'wildflowers',
  'grass', 'lawn', 'meadow',
  'bush', 'leaves', 'foliage',

  // Landscapes - Terrain
  'mountain', 'mountains', 'peak',
  'hill', 'hills',
  'rock', 'rocks', 'boulder',
  'cliff', 'valley', 'canyon',
  'cave',

  // Water Bodies & Features
  'beach', 'sandy beach', 'rocky beach',
  'ocean', 'sea', 'water', 'lake', 'pond',
  'river', 'stream', 'waterfall',
  'waves', 'surf', 'calm water',
  'sand', 'shore', 'coast', 'coastline',
  'island', 'bay', 'harbor',
  'ice', 'snow', 'glacier',

  // Urban/Rural Settings
  'city', 'urban', 'downtown', 'skyline',
  'street', 'road', 'highway',
  'sidewalk',
  'countryside', 'rural', 'village',
  'field', 'farm',
  'park', 'garden', 'yard',
  'playground', 'tennis court',
  'parking lot',

  // Interior/Exterior
  'indoor', 'outdoor',

  // Geographic Features
  'desert', 'sand dunes',
  'plains', 'prairie',

  // Sky & Weather Conditions
  'sky', 'blue sky', 'clear sky', 'dramatic sky',
  'sunset', 'sunrise', 'dusk', 'golden hour', 'blue hour',
  'clouds', 'cloudy', 'storm clouds',
  'sunny', 'bright', 'sunlight',
  'rainy', 'rain', 'storm',
  'foggy', 'fog', 'mist',
  'rainbow',

  // Time of Day & Lighting
  'night', 'nighttime', 'evening', 'morning', 'daytime',
  'dark', 'shadow',
  'moonlight', 'starry', 'stars',

  // Seasons
  'spring', 'summer', 'autumn', 'fall', 'winter',
  'snowy', 'fall colors',

  // Composition & Perspective
  'aerial view', 'aerial', 'drone shot', 'drone photography',
  'landscape', 'scenic view', 'vista', 'panorama',
  'portrait', 'close-up', 'macro',
  'wide angle',

  // Visual Effects & Qualities
  'reflection', 'water reflection',
  'silhouette', 'backlit',
  'symmetry', 'pattern', 'texture',
  'bokeh', 'shallow depth of field',
  'motion blur', 'long exposure',

  // Color & Tone
  'colorful', 'vibrant', 'bright colors',
  'pastel', 'muted colors',
  'monochrome', 'black and white',
  'blue', 'teal',
  'green', 'orange', 'golden',
  'red', 'pink',
  'purple', 'yellow',
  'warm tones', 'cool tones',

  // Mood & Atmosphere
  'serene', 'peaceful', 'calm',
  'dramatic', 'moody',
  'minimalist',
  'rustic', 'vintage',
  'modern',
  'natural', 'wild',
  'empty', 'isolated',
  'crowded', 'busy',

  // Artistic & Technical
  'high contrast', 'HDR',
  'soft',
  'dramatic lighting', 'natural lighting',
];

// Load or initialize caption cache
function loadCaptionCache(dataDir) {
  const cachePath = path.join(dataDir, 'captions.json');
  if (fs.existsSync(cachePath)) {
    console.log('📖 Loading caption cache...');
    return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  }
  console.log('📝 No caption cache found, will generate fresh captions');
  return {};
}

// Save caption cache to disk
function saveCaptionCache(dataDir, cache) {
  const cachePath = path.join(dataDir, 'captions.json');
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
  console.log('💾 Caption cache saved to public/data/captions.json');
}

// Check if photo needs new caption (file modified or no cache)
function needsNewCaption(filePath, file, cache) {
  if (!cache[file]) return true;
  
  const stats = fs.statSync(filePath);
  const fileModified = stats.mtimeMs;
  const cachedModified = cache[file].lastModified;
  
  return fileModified > cachedModified;
}

async function processPhotos() {
  console.log('🚀 Starting incremental photo processing...');

  const photoDir = path.join(__dirname, '../public/photos');
  const dataDir = path.join(__dirname, '../public/data');

  // Ensure output directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Load existing data
  const photosPath = path.join(dataDir, 'photos.json');
  const embeddingsPath = path.join(dataDir, 'embeddings.json');

  let existingPhotos = [];
  let existingEmbeddings = {};

  if (fs.existsSync(photosPath)) {
    console.log('📖 Loading existing photos.json...');
    existingPhotos = JSON.parse(fs.readFileSync(photosPath, 'utf8'));
  }

  if (fs.existsSync(embeddingsPath)) {
    console.log('📖 Loading existing embeddings.json...');
    existingEmbeddings = JSON.parse(fs.readFileSync(embeddingsPath, 'utf8'));
  }

  // Load caption cache
  const captionCache = loadCaptionCache(dataDir);

  // Build lookup of existing photos by ID
  const existingPhotosMap = new Map(existingPhotos.map(p => [p.id, p]));

  const files = fs.readdirSync(photoDir)
    .filter(f => /\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i.test(f));

  console.log(`📸 Found ${files.length} photos in directory`);

  // Determine which photos need processing
  const filesToProcess = [];
  const filesUpToDate = [];

  for (const file of files) {
    const filePath = path.join(photoDir, file);
    const stats = fs.statSync(filePath);
    const existingPhoto = existingPhotosMap.get(file);

    // Process if: new file OR file was modified OR missing embedding
    if (!existingPhoto ||
        !existingPhoto.lastProcessed ||
        stats.mtimeMs > new Date(existingPhoto.lastProcessed).getTime() ||
        !existingEmbeddings[file]) {
      filesToProcess.push(file);
    } else {
      filesUpToDate.push(file);
    }
  }

  console.log(`✨ ${filesToProcess.length} new/modified photos to process`);
  console.log(`✓ ${filesUpToDate.length} photos already up-to-date`);
  console.log('');

  // If nothing to process, we're done!
  if (filesToProcess.length === 0) {
    console.log('🎉 All photos are already processed and up-to-date!');
    return;
  }

  // Initialize AI models (only if needed)
  console.log('📦 Loading AI models...');
  const embedModel = await pipeline('feature-extraction', 'Xenova/multilingual-e5-small');
  const clipModel = await pipeline('zero-shot-image-classification', 'Xenova/clip-vit-base-patch16');
  const captionModel = await pipeline('image-to-text', 'Xenova/vit-gpt2-image-captioning');

  let captionsGenerated = 0;
  let captionsCached = 0;

  // Process only the files that need updating
  console.log('');

  for (const [index, file] of filesToProcess.entries()) {
    const filePath = path.join(photoDir, file);

    console.log(`[${index + 1}/${filesToProcess.length}] ${file}`);

    // Extract EXIF data
    const exif = await exifr.parse(filePath, {
      gps: true,
      exif: true,
      iptc: true,
    });

    // Extract GPS coordinates if available
    // Preserve existing location data (especially manually-set state/country) if GPS coords haven't changed
    const existingLocation = existingPhotosMap.get(file)?.location;
    let location = null;

    if (exif?.latitude && exif?.longitude) {
      // Check if GPS coordinates are the same as existing
      const gpsChanged = !existingLocation ||
                        existingLocation.lat !== exif.latitude ||
                        existingLocation.lng !== exif.longitude;

      if (gpsChanged) {
        // GPS changed or new photo - auto-detect country
        location = {
          lat: exif.latitude,
          lng: exif.longitude,
          country: determineCountry(exif.latitude, exif.longitude)
        };
      } else {
        // GPS unchanged - preserve existing location data (keeps manual edits)
        location = existingLocation;
      }
    }
    
    // Generate or retrieve AI tags using CLIP and natural language caption
    let aiTags = [];
    let aiTagsWithScores = [];
    let naturalCaption = '';
    const stats = fs.statSync(filePath);

    if (needsNewCaption(filePath, file, captionCache)) {
      console.log('  🤖 Analyzing image with CLIP...');
      try {
        // Use CLIP to classify image across all categories
        const results = await clipModel(filePath, CLIP_CATEGORIES, { top_k: null });

        // Keep tags with confidence > 0.06 (lower threshold for better recall)
        // Sort by score and take top matches
        aiTagsWithScores = results
          .filter(r => r.score > 0.06)
          .sort((a, b) => b.score - a.score)
          .slice(0, 30) // Limit to top 30 tags
          .map(r => ({ label: r.label, score: r.score }));

        aiTags = aiTagsWithScores.map(t => t.label);
        console.log(`  ✓ Tags: ${aiTags.slice(0, 5).join(', ')}${aiTags.length > 5 ? '...' : ''}`);
      } catch (error) {
        console.log(`  ⚠️  CLIP analysis failed: ${error.message}`);
        aiTags = [];
        aiTagsWithScores = [];
      }

      // Generate natural language caption
      console.log('  💬 Generating natural language caption...');
      try {
        const captionResult = await captionModel(filePath);
        naturalCaption = captionResult[0]?.generated_text || '';
        console.log(`  ✓ Caption: "${naturalCaption}"`);
      } catch (error) {
        console.log(`  ⚠️  Caption generation failed: ${error.message}`);
        naturalCaption = '';
      }

      // Cache the tags WITH scores AND natural caption
      captionCache[file] = {
        aiCaption: aiTags.join(', '), // Store as comma-separated for readability
        aiTags: aiTags,
        aiTagsWithScores: aiTagsWithScores,
        naturalCaption: naturalCaption, // NEW: Natural language description
        lastModified: stats.mtimeMs,
        generatedAt: new Date().toISOString()
      };
      captionsGenerated++;
    } else {
      aiTags = captionCache[file].aiTags || [];
      aiTagsWithScores = captionCache[file].aiTagsWithScores || [];
      naturalCaption = captionCache[file].naturalCaption || '';
      captionsCached++;
      console.log(`  💾 Using cached: ${aiTags.slice(0, 3).join(', ')}${aiTags.length > 3 ? '...' : ''} | "${naturalCaption}"`);
    }

    // Create photo metadata
    const photoData = {
      id: file,
      path: `/photos/${file}`,
      width: exif?.ImageWidth || 1920,
      height: exif?.ImageHeight || 1080,

      // Camera info
      camera: exif?.Model === 'FC8482' ? 'DJI Mini 4 Pro' : (exif?.Model || exif?.Make || 'Unknown'),
      lens: exif?.LensModel || null,

      // Technical settings
      iso: exif?.ISO || null,
      aperture: exif?.FNumber || exif?.ApertureValue || null,
      shutterSpeed: exif?.ExposureTime || null,
      focalLength: exif?.FocalLength || null,

      // Date/time
      date: exif?.DateTimeOriginal || exif?.CreateDate || null,

      // Location
      location,

      // Manual categorization - preserve existing trip if already set, otherwise determine from date
      trip: existingPhotosMap.get(file)?.trip || determineTrip(exif?.DateTimeOriginal),

      // AI-generated tags from CLIP
      aiCaption: aiTags.join(', '), // For compatibility
      aiTags: aiTags,
      aiTagsWithScores: aiTagsWithScores, // Tags with confidence scores

      // Natural language caption from vit-gpt2
      naturalCaption: naturalCaption, // NEW: Full sentence description

      // Manual overrides (if any)
      manualTags: MANUAL_OVERRIDES[file]?.tags || [],
      hasManualOverride: !!MANUAL_OVERRIDES[file],
      replaceAI: MANUAL_OVERRIDES[file]?.replaceAI || false,

      // Processing timestamp
      lastProcessed: new Date().toISOString(),
    };

    // Update existing photo or add new one
    existingPhotosMap.set(file, photoData);

    // Generate semantic description for AI search (tags + natural caption with confidence-based weighting)
    const description = generateDescription(photoData, aiTagsWithScores, naturalCaption);

    // Generate embedding from description (now 768-dim)
    const result = await embedModel(description, {
      pooling: 'mean',
      normalize: true
    });

    // Update embeddings
    existingEmbeddings[file] = Array.from(result.data);
  }

  // Merge all photos (existing + newly processed)
  const allPhotos = Array.from(existingPhotosMap.values());

  // Remove embeddings for photos that no longer exist
  const currentFileSet = new Set(files);
  for (const photoId of Object.keys(existingEmbeddings)) {
    if (!currentFileSet.has(photoId)) {
      delete existingEmbeddings[photoId];
    }
  }

  // Save caption cache
  saveCaptionCache(dataDir, captionCache);

  // Save outputs
  fs.writeFileSync(
    path.join(dataDir, 'photos.json'),
    JSON.stringify(allPhotos, null, 2)
  );
  fs.writeFileSync(
    path.join(dataDir, 'embeddings.json'),
    JSON.stringify(existingEmbeddings)
  );

  console.log('');
  console.log('='.repeat(80));
  console.log(`✅ Successfully processed ${filesToProcess.length} new/modified photos`);
  console.log(`📊 Total photos: ${allPhotos.length}`);
  console.log(`📊 Metadata saved to public/data/photos.json`);
  console.log(`🧠 Embeddings saved to public/data/embeddings.json`);
  console.log(`💾 Captions saved to public/data/captions.json`);
  console.log('');
  console.log(`🤖 AI Captions: ${captionsGenerated} generated, ${captionsCached} from cache`);
  console.log(`✍️  Manual overrides: ${Object.keys(MANUAL_OVERRIDES).length} photos`);
}

// Helper: Determine trip based on date
function determineTrip(date) {
  if (!date) return 'Uncategorized';

  const photoDate = new Date(date);

  // Add your trip date ranges here
  if (photoDate >= new Date('2025-06-01') && photoDate <= new Date('2025-06-30')) {
    return 'Scandinavia 2025';
  }

  return 'Uncategorized';
}

// Helper: Generate rich semantic description for AI search with confidence-based weighting + natural caption
function generateDescription(photo, aiTagsWithScores, naturalCaption = '') {
  const parts = [];
  const filename = photo.id.toLowerCase();

  // PRIORITY 1: Manual override - if replaceAI is true, use ONLY manual tags
  if (photo.replaceAI && photo.manualTags && photo.manualTags.length > 0) {
    // Repeat manual tags 3x for maximum weight
    parts.push(photo.manualTags.join(' '));
    parts.push(photo.manualTags.join(' '));
    parts.push(photo.manualTags.join(' '));

    // Skip AI and most metadata when replaceAI is true
    // Only add minimal context
    if (photo.location?.country) {
      parts.push(`${photo.location.country}`);
    }
    return parts.join(' ');
  }

  // PRIORITY 2: Natural language caption (high value - repeat 3x)
  if (naturalCaption && naturalCaption.trim()) {
    parts.push(naturalCaption);
    parts.push(naturalCaption);
    parts.push(naturalCaption);
  }

  // PRIORITY 3: AI Tags from CLIP with confidence-based weighting
  if (aiTagsWithScores && aiTagsWithScores.length > 0) {
    // High confidence tags (score > 0.25): repeat 3x for maximum weight
    const highConfTags = aiTagsWithScores
      .filter(t => t.score > 0.25)
      .map(t => t.label);
    if (highConfTags.length > 0) {
      parts.push(highConfTags.join(' '));
      parts.push(highConfTags.join(' '));
      parts.push(highConfTags.join(' '));
    }

    // Medium confidence tags (0.15 < score <= 0.25): repeat 2x
    const medConfTags = aiTagsWithScores
      .filter(t => t.score > 0.15 && t.score <= 0.25)
      .map(t => t.label);
    if (medConfTags.length > 0) {
      parts.push(medConfTags.join(' '));
      parts.push(medConfTags.join(' '));
    }

    // Low confidence tags (0.06 < score <= 0.15): repeat 1x
    const lowConfTags = aiTagsWithScores
      .filter(t => t.score > 0.06 && t.score <= 0.15)
      .map(t => t.label);
    if (lowConfTags.length > 0) {
      parts.push(lowConfTags.join(' '));
    }
  }

  // PRIORITY 4: Manual supplement tags (add to AI tags)
  if (photo.manualTags && photo.manualTags.length > 0) {
    // Repeat manual tags 2x (slightly less than AI but still important)
    parts.push(photo.manualTags.join(' '));
    parts.push(photo.manualTags.join(' '));
  }

  // PRIORITY 4: Metadata context (minimal weight)
  // Only add location and device context - let CLIP handle time/lighting detection
  const allAiTags = aiTagsWithScores ? aiTagsWithScores.map(t => t.label.toLowerCase()) : [];

  // Location context
  if (photo.location?.country) {
    parts.push(`${photo.location.country}`);
  }

  // Device type - only add if CLIP didn't detect aerial/perspective
  const isDrone = photo.camera?.includes('DJI') || filename.includes('dji');
  if (isDrone && !allAiTags.includes('aerial view') && !allAiTags.includes('aerial')) {
    parts.push('aerial drone photography');
  }

  // Trip context (minimal weight)
  if (photo.trip === 'Scandinavia 2025') {
    parts.push('Scandinavia travel');
  }

  return parts.join(' ');
}

// Helper: Determine country from GPS coordinates
// This is a simplified approach - for production, consider using a proper geocoding service
function determineCountry(lat, lng) {
  // North America
  if (lat >= 24.5 && lat <= 49.4 && lng >= -125 && lng <= -66.9) {
    return 'United States';
  }
  if (lat >= 41.7 && lat <= 83.1 && lng >= -141 && lng <= -52.6) {
    return 'Canada';
  }
  if (lat >= 14.5 && lat <= 32.7 && lng >= -118.4 && lng <= -86.7) {
    return 'Mexico';
  }

  // Scandinavia and Northern Europe
  if (lat >= 58 && lat <= 71 && lng >= 4.5 && lng <= 31.3) {
    if (lng < 12) return 'Norway';
    if (lng < 24) return 'Sweden';
    if (lng >= 20 && lat >= 60) return 'Finland';
    return 'Denmark';
  }

  // Western Europe
  if (lat >= 42.3 && lat <= 51.1 && lng >= -5 && lng <= 9.6) {
    if (lng < -1) return 'United Kingdom';
    if (lat > 49 && lng > 2 && lng < 7) return 'Belgium';
    if (lat > 47 && lng > 5.5) return 'Germany';
    return 'France';
  }

  // Southern Europe
  if (lat >= 36.0 && lat <= 47.1 && lng >= 6.6 && lng <= 18.5) {
    if (lng < 7.5) return 'France';
    if (lat > 45.8) return 'Switzerland';
    return 'Italy';
  }
  if (lat >= 36.0 && lat <= 43.8 && lng >= -9.3 && lng <= 3.3) {
    if (lng < -7) return 'Portugal';
    return 'Spain';
  }

  // Eastern Europe
  if (lat >= 45 && lat <= 56 && lng >= 14 && lng <= 40) {
    if (lng < 19) return 'Poland';
    if (lng < 27) return 'Ukraine';
    return 'Russia';
  }

  // East Asia
  if (lat >= 18 && lat <= 54 && lng >= 73 && lng <= 135) {
    if (lng > 122 && lat > 30) return 'Japan';
    if (lng > 124 && lat > 33 && lat < 43) return 'South Korea';
    if (lng < 92) return 'India';
    return 'China';
  }

  // Southeast Asia
  if (lat >= -11 && lat <= 28 && lng >= 95 && lng <= 122) {
    if (lat > 13 && lat < 24 && lng > 99 && lng < 109) return 'Thailand';
    if (lat > 1 && lat < 7 && lng > 103 && lng < 105) return 'Singapore';
    if (lat < 6 && lng > 95 && lng < 142) return 'Indonesia';
    return 'Vietnam';
  }

  // Oceania
  if (lat >= -47 && lat <= -10 && lng >= 113 && lng <= 154) {
    return 'Australia';
  }
  if (lat >= -47 && lat <= -34 && lng >= 166 && lng <= 179) {
    return 'New Zealand';
  }

  // South America
  if (lat >= -34 && lat <= 5 && lng >= -74 && lng <= -34) {
    if (lat > -23) return 'Brazil';
    if (lng < -58) return 'Argentina';
    return 'Brazil';
  }

  // Africa
  if (lat >= -35 && lat <= 37 && lng >= -18 && lng <= 52) {
    if (lat < -22 && lng > 16) return 'South Africa';
    if (lat > 22 && lat < 32 && lng > 25 && lng < 35) return 'Egypt';
    if (lat > 30 && lng > -10 && lng < 10) return 'Morocco';
    return 'Unknown'; // Other African countries
  }

  return 'Unknown';
}

processPhotos().catch(console.error);
