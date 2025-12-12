let embedModel = null;

// Project-specific synonym map for better search matching
const PROJECT_SYNONYMS = {
  // Frontend technologies
  'frontend': ['ui', 'client', 'client-side', 'react', 'vue', 'angular', 'interface', 'web', 'browser', 'component'],
  'ui': ['frontend', 'interface', 'user interface', 'design', 'component', 'view'],
  'react': ['frontend', 'ui', 'component', 'jsx', 'nextjs', 'next.js'],
  'nextjs': ['react', 'frontend', 'next.js', 'server-side rendering', 'ssr'],
  'vue': ['frontend', 'ui', 'component', 'vuejs'],
  'angular': ['frontend', 'ui', 'component', 'typescript'],

  // Backend technologies
  'backend': ['server', 'api', 'database', 'node', 'python', 'rest', 'server-side', 'backend'],
  'api': ['backend', 'rest', 'endpoint', 'server', 'service', 'http'],
  'rest': ['api', 'restful', 'http', 'endpoint', 'web service'],
  'nodejs': ['backend', 'node.js', 'javascript', 'server', 'express'],
  'python': ['backend', 'django', 'flask', 'fastapi', 'server'],
  'database': ['backend', 'sql', 'nosql', 'data', 'storage', 'db'],

  // Full stack
  'fullstack': ['full-stack', 'end-to-end', 'complete', 'frontend', 'backend', 'full stack'],
  'full-stack': ['fullstack', 'end-to-end', 'complete', 'frontend', 'backend'],

  // AI/ML
  'ai': ['ml', 'machine learning', 'artificial intelligence', 'neural', 'gpt', 'llm', 'model', 'deep learning'],
  'ml': ['ai', 'machine learning', 'model', 'training', 'neural', 'data science'],
  'machine learning': ['ai', 'ml', 'neural', 'model', 'training', 'deep learning'],
  'gpt': ['ai', 'llm', 'openai', 'language model', 'chatgpt'],
  'llm': ['ai', 'gpt', 'language model', 'openai', 'transformer'],
  'neural': ['ai', 'ml', 'neural network', 'deep learning', 'model'],

  // Mobile
  'mobile': ['ios', 'android', 'app', 'react native', 'flutter', 'mobile app'],
  'ios': ['mobile', 'iphone', 'ipad', 'swift', 'apple'],
  'android': ['mobile', 'kotlin', 'java', 'google'],

  // Databases
  'sql': ['database', 'postgresql', 'mysql', 'sqlite', 'relational'],
  'nosql': ['database', 'mongodb', 'firebase', 'non-relational'],
  'postgresql': ['database', 'sql', 'postgres', 'relational'],
  'mongodb': ['database', 'nosql', 'mongo', 'document'],
  'sqlite': ['database', 'sql', 'embedded'],

  // DevOps & Tools
  'docker': ['devops', 'container', 'containerization', 'deployment'],
  'aws': ['cloud', 'amazon', 'devops', 'deployment'],
  'cloud': ['aws', 'azure', 'gcp', 'devops', 'deployment'],
  'deployment': ['devops', 'cloud', 'docker', 'production'],

  // Real-time
  'realtime': ['websocket', 'real-time', 'live', 'socket', 'instant'],
  'websocket': ['realtime', 'socket.io', 'live', 'connection'],
  'chat': ['messaging', 'realtime', 'communication', 'conversation'],

  // Authentication
  'auth': ['authentication', 'authorization', 'login', 'security', 'jwt'],
  'authentication': ['auth', 'login', 'security', 'user', 'session'],
  'jwt': ['auth', 'token', 'authentication', 'authorization'],

  // Search
  'search': ['query', 'find', 'filter', 'lookup', 'semantic'],
  'semantic': ['ai', 'search', 'embedding', 'meaning', 'nlp'],

  // Visualization
  'visualization': ['chart', 'graph', 'dashboard', 'd3', 'data viz'],
  'dashboard': ['visualization', 'analytics', 'metrics', 'admin'],

  // General concepts
  'app': ['application', 'web app', 'software', 'program'],
  'web': ['website', 'frontend', 'internet', 'online'],
  'automation': ['script', 'task', 'workflow', 'bot'],
};

// Expand query with synonyms
function expandQuery(query) {
  const words = query.toLowerCase().split(/\s+/);
  const expanded = new Set([query]); // Include original

  words.forEach(word => {
    // Add the word itself
    expanded.add(word);

    // Add synonyms if available
    if (PROJECT_SYNONYMS[word]) {
      PROJECT_SYNONYMS[word].forEach(syn => expanded.add(syn));
    }
  });

  return Array.from(expanded).join(' ');
}

export function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;

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
  try {
    if (!embedModel) {
      const { pipeline, env } = await import('@xenova/transformers');

      // Configure to use HuggingFace CDN (fixes 404 errors in Next.js)
      env.allowLocalModels = false;
      env.useBrowserCache = true;

      // Use multilingual-e5-small to match project embeddings
      embedModel = await pipeline('feature-extraction', 'Xenova/multilingual-e5-small');
    }

    const result = await embedModel(query, { pooling: 'mean', normalize: true });

    if (!result || !result.data) {
      console.error('Embedding model returned invalid result');
      return null;
    }

    return Array.from(result.data);
  } catch (error) {
    console.error('Error generating query embedding:', error);
    return null;
  }
}

export async function searchProjects(projects, query, filters, embeddings) {
  let results = [...projects];

  // Apply tech stack filter (OR logic - match any selected tech)
  if (filters.techStack && filters.techStack.length > 0) {
    results = results.filter(project =>
      filters.techStack.some(tech => project.techStack.includes(tech))
    );
  }

  // Apply category filter
  if (filters.category) {
    results = results.filter(p => p.category === filters.category);
  }

  // Apply year filter
  if (filters.year) {
    results = results.filter(p => p.metadata?.year === filters.year);
  }

  // Apply status filter
  if (filters.status) {
    results = results.filter(p => p.metadata?.status === filters.status);
  }

  // If no query, return filtered results
  if (!query || !query.trim()) {
    return results;
  }

  // Expand the query with related terms for better matching
  const expandedQuery = expandQuery(query);
  const queryEmbedding = await getQueryEmbedding(expandedQuery);

  // ==========================
  // STEP 1: Semantic Search
  // ==========================
  let semanticResults = [];

  if (queryEmbedding && embeddings && Object.keys(embeddings).length > 0) {
    // Semantic search is available
    semanticResults = results.map(project => ({
      ...project,
      semanticScore: embeddings[project.id]
        ? cosineSimilarity(queryEmbedding, embeddings[project.id])
        : 0
    }))
    .sort((a, b) => b.semanticScore - a.semanticScore);
  } else {
    // Fallback: semantic search not available
    console.warn('Semantic search unavailable, using BM25-only mode');
    semanticResults = results.map(project => ({
      ...project,
      semanticScore: 0
    }));
  }

  // ==========================
  // STEP 2: BM25 Keyword Search
  // ==========================
  const { BM25, reciprocalRankFusion } = await import('./bm25.js');

  // Prepare documents for BM25
  const documents = results.map(project => {
    const parts = [];

    // Title (3x weight - most important)
    parts.push(project.title);
    parts.push(project.title);
    parts.push(project.title);

    // Tagline (2x weight)
    parts.push(project.tagline);
    parts.push(project.tagline);

    // Description (2x weight)
    parts.push(project.description);
    parts.push(project.description);

    // Tech stack (2x weight)
    const techString = project.techStack.join(' ');
    parts.push(techString);
    parts.push(techString);

    // Category (1x weight)
    parts.push(project.category);

    // Status and year
    if (project.metadata?.status) {
      parts.push(project.metadata.status);
    }
    if (project.metadata?.year) {
      parts.push(String(project.metadata.year));
    }

    return {
      id: project.id,
      project,
      searchText: parts.join(' ')
    };
  });

  const bm25 = new BM25(documents);
  const bm25Results = bm25.search(expandedQuery, results.length);

  // ==========================
  // STEP 3: Reciprocal Rank Fusion (combine rankings)
  // ==========================
  const semanticRankedList = semanticResults.map(p => ({ id: p.id }));
  const bm25RankedList = bm25Results.map(p => ({ id: p.id }));

  const fusedScores = reciprocalRankFusion([semanticRankedList, bm25RankedList]);

  // Merge all scores together
  const scoreMap = new Map();
  semanticResults.forEach(p => {
    scoreMap.set(p.id, { ...p, semanticScore: p.semanticScore, bm25Score: 0, rrfScore: 0 });
  });
  bm25Results.forEach(p => {
    const existing = scoreMap.get(p.id) || { ...p.project, semanticScore: 0 };
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
  // Require BM25 keyword match (no semantic-only results)
  const filteredResults = hybridResults.filter(p => p.bm25Score > 0);

  // If we have keyword matches, use them
  if (filteredResults.length > 0) {
    results = filteredResults;
  } else {
    // Fallback: if no keyword matches, return top semantic results
    const MIN_SEMANTIC_SCORE = 0.5;
    const semanticFallback = hybridResults
      .filter(p => p.semanticScore > MIN_SEMANTIC_SCORE)
      .slice(0, 10);

    results = semanticFallback;
    console.log(`Search "${query}" - No keyword matches, using semantic fallback (${semanticFallback.length} results)`);
  }

  // Log scores for debugging
  if (results.length > 0) {
    console.log(`Search "${query}" found ${results.length} matches. Top 3 scores:`,
      results.slice(0, 3).map(p => ({
        title: p.title,
        semantic: p.semanticScore?.toFixed(3),
        bm25: p.bm25Score?.toFixed(3),
        rrf: p.rrfScore?.toFixed(3)
      }))
    );
  } else {
    console.log(`Search "${query}" found no matches`);
  }

  return results;
}
