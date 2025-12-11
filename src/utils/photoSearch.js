let embedModel = null;

// Expanded synonym map for better search matching (100+ mappings)
const SYNONYM_MAP = {
  // Water & Water Bodies
  'water': ['water', 'ocean', 'sea', 'lake', 'river', 'pond', 'stream', 'aquatic', 'maritime', 'coastal'],
  'ocean': ['ocean', 'sea', 'water', 'waves', 'beach', 'coast', 'marine', 'oceanic', 'surf'],
  'sea': ['sea', 'ocean', 'water', 'waves', 'maritime', 'marine', 'seashore'],
  'lake': ['lake', 'pond', 'water', 'reservoir', 'lagoon'],
  'river': ['river', 'stream', 'creek', 'brook', 'waterway', 'water'],
  'beach': ['beach', 'shore', 'coast', 'sand', 'seaside', 'shoreline', 'seashore', 'sandy beach'],
  'waves': ['waves', 'surf', 'tide', 'swell', 'breakers', 'ocean', 'sea'],

  // Sky & Weather
  'sunset': ['sunset', 'dusk', 'evening', 'golden hour', 'orange sky', 'twilight', 'sundown'],
  'sunrise': ['sunrise', 'dawn', 'morning', 'golden hour', 'daybreak', 'first light'],
  'sky': ['sky', 'clouds', 'heavens', 'atmosphere', 'air', 'firmament'],
  'clouds': ['clouds', 'cloudy', 'overcast', 'sky', 'cumulus', 'storm clouds'],
  'night': ['night', 'nighttime', 'dark', 'evening', 'nocturnal', 'darkness', 'after dark'],
  'day': ['day', 'daytime', 'daylight', 'bright', 'sunny', 'afternoon', 'morning'],
  'sunny': ['sunny', 'bright', 'sunshine', 'sun', 'clear', 'sunlight'],
  'fog': ['fog', 'foggy', 'mist', 'misty', 'haze', 'hazy'],
  'rain': ['rain', 'rainy', 'wet', 'drizzle', 'storm', 'precipitation'],
  'snow': ['snow', 'snowy', 'winter', 'ice', 'icy', 'frost', 'frozen'],

  // Landscapes & Terrain
  'landscape': ['landscape', 'scenery', 'vista', 'view', 'panorama', 'scene', 'scenic'],
  'mountain': ['mountain', 'mountains', 'peak', 'summit', 'hill', 'alpine', 'mountain range'],
  'hill': ['hill', 'hills', 'hillside', 'slope', 'mountain', 'rolling hills'],
  'forest': ['forest', 'woods', 'trees', 'woodland', 'wooded', 'nature', 'timber'],
  'tree': ['tree', 'trees', 'forest', 'woods', 'foliage', 'branches'],
  'desert': ['desert', 'arid', 'sand dunes', 'barren', 'dry'],
  'canyon': ['canyon', 'gorge', 'ravine', 'valley', 'cliff'],
  'valley': ['valley', 'basin', 'canyon', 'gorge', 'dale'],

  // Nature & Plants
  'nature': ['nature', 'natural', 'outdoors', 'wildlife', 'wild', 'environment'],
  'flower': ['flower', 'flowers', 'blossom', 'bloom', 'floral', 'botanical'],
  'grass': ['grass', 'lawn', 'meadow', 'field', 'green', 'grassland'],
  'field': ['field', 'meadow', 'prairie', 'grassland', 'farmland', 'pasture'],

  // Architecture & Built Environment
  'building': ['building', 'architecture', 'structure', 'construction', 'edifice', 'house'],
  'house': ['house', 'home', 'building', 'residence', 'dwelling', 'cabin', 'cottage'],
  'city': ['city', 'urban', 'downtown', 'metropolitan', 'cityscape', 'town'],
  'urban': ['urban', 'city', 'metropolitan', 'downtown', 'cityscape'],
  'street': ['street', 'road', 'avenue', 'alley', 'path', 'lane'],
  'bridge': ['bridge', 'overpass', 'crossing', 'span', 'viaduct'],
  'tower': ['tower', 'spire', 'monument', 'structure', 'tall building'],
  'church': ['church', 'cathedral', 'chapel', 'temple', 'religious building'],

  // Watercraft & Docks
  'boat': ['boat', 'ship', 'vessel', 'watercraft', 'sailing', 'yacht', 'sailboat'],
  'ship': ['ship', 'boat', 'vessel', 'watercraft', 'maritime'],
  'canoe': ['canoe', 'kayak', 'boat', 'paddle', 'watercraft'],
  'kayak': ['kayak', 'canoe', 'boat', 'paddle', 'watercraft'],
  'pier': ['pier', 'dock', 'wharf', 'jetty', 'boardwalk', 'marina'],
  'dock': ['dock', 'pier', 'wharf', 'marina', 'harbor', 'port'],

  // Animals & Wildlife
  'bird': ['bird', 'birds', 'seagull', 'eagle', 'hawk', 'wildlife', 'avian', 'feather'],
  'seagull': ['seagull', 'bird', 'gull', 'seabird', 'coastal bird'],
  'wildlife': ['wildlife', 'animal', 'animals', 'creature', 'fauna', 'wild'],
  'animal': ['animal', 'animals', 'wildlife', 'creature', 'fauna', 'beast'],
  'dog': ['dog', 'canine', 'puppy', 'pet', 'hound'],
  'fish': ['fish', 'fishing', 'marine life', 'seafood', 'aquatic'],

  // People & Activities
  'person': ['person', 'people', 'human', 'man', 'woman', 'figure', 'portrait'],
  'people': ['people', 'person', 'humans', 'crowd', 'group', 'folk'],
  'crowd': ['crowd', 'people', 'group', 'gathering', 'mass', 'throng'],
  'portrait': ['portrait', 'person', 'people', 'face', 'headshot', 'photograph'],
  'walking': ['walking', 'strolling', 'hiking', 'pedestrian', 'moving'],
  'hiking': ['hiking', 'walking', 'trekking', 'trail', 'outdoor'],
  'swimming': ['swimming', 'swim', 'water', 'beach', 'pool'],
  'surfing': ['surfing', 'surf', 'waves', 'ocean', 'beach', 'water sport'],

  // Vehicles
  'car': ['car', 'vehicle', 'automobile', 'auto', 'motor vehicle'],
  'vehicle': ['vehicle', 'car', 'automobile', 'transportation', 'transport'],
  'bike': ['bike', 'bicycle', 'cycling', 'two-wheeler'],
  'airplane': ['airplane', 'plane', 'aircraft', 'jet', 'aviation'],
  'drone': ['drone', 'aerial', 'UAV', 'quadcopter', 'unmanned'],

  // Composition & Perspective
  'aerial': ['aerial', 'drone', 'overhead', 'bird\'s eye view', 'top-down', 'from above'],
  'closeup': ['closeup', 'close-up', 'macro', 'detail', 'zoom'],
  'panorama': ['panorama', 'panoramic', 'wide', 'vista', 'landscape', 'view'],

  // Lighting & Time
  'golden hour': ['golden hour', 'sunset', 'sunrise', 'dusk', 'dawn', 'magic hour'],
  'blue hour': ['blue hour', 'twilight', 'dusk', 'dawn', 'evening'],
  'dark': ['dark', 'darkness', 'night', 'shadow', 'dim', 'low light'],
  'bright': ['bright', 'light', 'sunny', 'illuminated', 'brilliant'],
  'shadow': ['shadow', 'shadows', 'shade', 'silhouette', 'dark'],

  // Colors
  'blue': ['blue', 'azure', 'teal', 'turquoise', 'cyan', 'navy'],
  'green': ['green', 'emerald', 'lime', 'forest green', 'verdant'],
  'red': ['red', 'crimson', 'scarlet', 'ruby', 'cherry'],
  'orange': ['orange', 'amber', 'tangerine', 'golden', 'rust'],
  'yellow': ['yellow', 'gold', 'golden', 'amber', 'sunshine'],
  'purple': ['purple', 'violet', 'lavender', 'plum', 'magenta'],
  'pink': ['pink', 'rose', 'blush', 'magenta', 'fuchsia'],

  // Mood & Atmosphere
  'peaceful': ['peaceful', 'calm', 'serene', 'tranquil', 'quiet', 'still'],
  'calm': ['calm', 'peaceful', 'serene', 'tranquil', 'still', 'relaxed'],
  'serene': ['serene', 'peaceful', 'calm', 'tranquil', 'quiet'],
  'dramatic': ['dramatic', 'striking', 'bold', 'intense', 'powerful', 'moody'],
  'beautiful': ['beautiful', 'scenic', 'pretty', 'gorgeous', 'stunning', 'lovely'],
  'colorful': ['colorful', 'vibrant', 'bright', 'vivid', 'chromatic'],

  // Seasons
  'summer': ['summer', 'summertime', 'warm', 'hot', 'sunny'],
  'winter': ['winter', 'cold', 'snow', 'ice', 'frozen', 'wintry'],
  'autumn': ['autumn', 'fall', 'autumn leaves', 'fall colors', 'foliage'],
  'fall': ['fall', 'autumn', 'fall colors', 'leaves', 'foliage'],
  'spring': ['spring', 'springtime', 'blossom', 'bloom', 'flowers'],

  // Reflections & Effects
  'reflection': ['reflection', 'mirror', 'reflected', 'water reflection'],
  'silhouette': ['silhouette', 'outline', 'shadow', 'backlit', 'profile'],
};

// Expand query with synonyms
function expandQuery(query) {
  const words = query.toLowerCase().split(/\s+/);
  const expanded = new Set([query]); // Include original
  
  words.forEach(word => {
    // Add the word itself
    expanded.add(word);
    
    // Add synonyms if available
    if (SYNONYM_MAP[word]) {
      SYNONYM_MAP[word].forEach(syn => expanded.add(syn));
    }
  });
  
  return Array.from(expanded).join(' ');
}

export function cosineSimilarity(a, b) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function getQueryEmbedding(query) {
  if (!embedModel) {
    const { pipeline, env } = await import('@xenova/transformers');

    // Configure to use HuggingFace CDN (fixes 404 errors in Next.js)
    env.allowLocalModels = false;
    env.useBrowserCache = true;

    // UPGRADED: Using multilingual-e5-small for better semantic quality
    // IMPORTANT: This MUST match the model used in scripts/process-photos.js
    // If you change this model, you must regenerate embeddings.json AND clear browser cache!
    embedModel = await pipeline('feature-extraction', 'Xenova/multilingual-e5-small');
  }

  const result = await embedModel(query, { pooling: 'mean', normalize: true });
  return Array.from(result.data);
}

export async function searchPhotos(query, filters, allPhotos) {
  let results = [...allPhotos];

  // Apply metadata filters first (fast)
  if (filters.camera) {
    results = results.filter(p => p.camera === filters.camera);
  }

  if (filters.trip) {
    results = results.filter(p => p.trip === filters.trip);
  }

  if (filters.country) {
    results = results.filter(p => p.location?.country === filters.country);
  }

  if (filters.dateRange) {
    results = results.filter(p => {
      if (!p.date) return false;
      const photoDate = new Date(p.date);
      return photoDate >= filters.dateRange.start && photoDate <= filters.dateRange.end;
    });
  }

  if (filters.iso) {
    results = results.filter(p =>
      p.iso && p.iso >= filters.iso[0] && p.iso <= filters.iso[1]
    );
  }

  if (filters.aperture) {
    results = results.filter(p =>
      p.aperture && p.aperture >= filters.aperture[0] && p.aperture <= filters.aperture[1]
    );
  }

  // TIER 3: Hybrid BM25 + Semantic search (if query provided)
  if (query && query.trim()) {
    const embeddings = await fetch('/data/embeddings.json').then(r => r.json());

    // Expand the query with related terms for better matching
    const expandedQuery = expandQuery(query);
    const queryEmbedding = await getQueryEmbedding(expandedQuery);

    // ==========================
    // STEP 1: Semantic Search (multilingual-e5-small embeddings)
    // ==========================
    const semanticResults = results.map(photo => ({
      ...photo,
      semanticScore: cosineSimilarity(queryEmbedding, embeddings[photo.id])
    }))
    .sort((a, b) => b.semanticScore - a.semanticScore);

    // ==========================
    // STEP 2: BM25 Keyword Search
    // ==========================
    const { BM25, reciprocalRankFusion } = await import('./bm25.js');

    // Prepare documents for BM25
    const documents = results.map(photo => {
      // Build searchable text from all available fields
      const parts = [];

      // Natural caption (3x weight)
      if (photo.naturalCaption) {
        parts.push(photo.naturalCaption);
        parts.push(photo.naturalCaption);
        parts.push(photo.naturalCaption);
      }

      // AI tags (2x weight)
      if (photo.aiTags) {
        const tags = photo.aiTags.join(' ');
        parts.push(tags);
        parts.push(tags);
      }

      // Manual tags (3x weight - highest priority)
      if (photo.manualTags) {
        const tags = photo.manualTags.join(' ');
        parts.push(tags);
        parts.push(tags);
        parts.push(tags);
      }

      // Location
      if (photo.location?.country) {
        parts.push(photo.location.country);
      }

      // Camera/lens
      if (photo.camera) {
        parts.push(photo.camera);
      }

      return {
        id: photo.id,
        photo,
        searchText: parts.join(' ')
      };
    });

    const bm25 = new BM25(documents);
    const bm25Results = bm25.search(expandedQuery, results.length);

    // ==========================
    // STEP 3: Reciprocal Rank Fusion (combine rankings)
    // ==========================
    // Convert to ranked lists with IDs
    const semanticRankedList = semanticResults.map(p => ({ id: p.id }));
    const bm25RankedList = bm25Results.map(p => ({ id: p.id }));

    const fusedScores = reciprocalRankFusion([semanticRankedList, bm25RankedList]);

    // Merge all scores together
    const scoreMap = new Map();
    semanticResults.forEach(p => {
      scoreMap.set(p.id, { ...p, semanticScore: p.semanticScore, bm25Score: 0, rrfScore: 0 });
    });
    bm25Results.forEach(p => {
      const existing = scoreMap.get(p.id) || { ...p.photo, semanticScore: 0 };
      scoreMap.set(p.id, { ...existing, bm25Score: p.bm25Score });
    });
    fusedScores.forEach(({ id, rrfScore }) => {
      const existing = scoreMap.get(id);
      if (existing) {
        scoreMap.set(id, { ...existing, rrfScore });
      }
    });

    // Sort by RRF score (hybrid ranking)
    const hybridResults = Array.from(scoreMap.values())
      .sort((a, b) => b.rrfScore - a.rrfScore);

    // ==========================
    // STEP 4: Filtering
    // ==========================
    // STRICT MODE: Require BM25 keyword match (no semantic-only results)
    // This ensures we only return photos that actually mention the search terms
    const filteredResults = hybridResults.filter(p => p.bm25Score > 0);

    // If we have keyword matches, use them
    if (filteredResults.length > 0) {
      results = filteredResults;
    } else {
      // Fallback: if no keyword matches, return top 5 semantic results
      // (only if semantic score is very high)
      const MIN_SEMANTIC_SCORE = 0.6;
      const semanticFallback = hybridResults
        .filter(p => p.semanticScore > MIN_SEMANTIC_SCORE)
        .slice(0, 5);

      results = semanticFallback;
      console.log(`Search "${query}" - No keyword matches, using semantic fallback (${semanticFallback.length} results)`);
    }

    // Log scores for debugging
    if (results.length > 0) {
      console.log(`Search "${query}" found ${results.length} matches. Top 5 scores:`,
        results.slice(0, 5).map(p => ({
          id: p.id,
          semantic: p.semanticScore?.toFixed(3),
          bm25: p.bm25Score?.toFixed(3),
          rrf: p.rrfScore?.toFixed(3)
        }))
      );
    } else {
      console.log(`Search "${query}" found no matches`);
    }
  }

  return results;
}
