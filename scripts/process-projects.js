import { pipeline } from '@xenova/transformers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function processProjects() {
  console.log('🚀 Starting project embedding generation...');

  const dataDir = path.join(__dirname, '../public/data');
  const projectsPath = path.join(dataDir, 'projects.json');
  const embeddingsPath = path.join(dataDir, 'project-embeddings.json');

  // Check if projects.json exists
  if (!fs.existsSync(projectsPath)) {
    console.error('❌ projects.json not found at:', projectsPath);
    console.log('Please create projects.json first!');
    return;
  }

  // Load projects
  console.log('📖 Loading projects.json...');
  const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
  console.log(`📦 Found ${projects.length} projects`);

  // Load existing embeddings if they exist
  let existingEmbeddings = {};
  if (fs.existsSync(embeddingsPath)) {
    console.log('📖 Loading existing embeddings...');
    existingEmbeddings = JSON.parse(fs.readFileSync(embeddingsPath, 'utf8'));
  }

  // Initialize embedding model
  console.log('📦 Loading embedding model (Xenova/multilingual-e5-small)...');
  const embedModel = await pipeline('feature-extraction', 'Xenova/multilingual-e5-small');
  console.log('✅ Model loaded successfully');
  console.log('');

  const newEmbeddings = {};
  let generated = 0;
  let cached = 0;

  for (const [index, project] of projects.entries()) {
    console.log(`[${index + 1}/${projects.length}] ${project.title}`);

    // Check if we already have an embedding for this project
    if (existingEmbeddings[project.id]) {
      console.log('  💾 Using cached embedding');
      newEmbeddings[project.id] = existingEmbeddings[project.id];
      cached++;
      continue;
    }

    // Generate searchable text by concatenating key fields
    const searchableText = [
      project.title,
      project.title, // Repeat title for higher weight
      project.tagline,
      project.tagline, // Repeat tagline for higher weight
      project.description,
      project.description, // Repeat description for higher weight
      project.techStack.join(' '),
      project.techStack.join(' '), // Repeat tech stack for higher weight
      project.category,
      project.metadata?.status || '',
      project.metadata?.year || '',
    ].filter(Boolean).join(' ');

    console.log(`  🤖 Generating embedding...`);

    // Generate embedding (384-dimensional vector)
    const result = await embedModel(searchableText, {
      pooling: 'mean',
      normalize: true
    });

    // Store embedding
    newEmbeddings[project.id] = Array.from(result.data);
    generated++;

    console.log(`  ✅ Embedding generated (${newEmbeddings[project.id].length} dimensions)`);
  }

  // Save embeddings
  fs.writeFileSync(embeddingsPath, JSON.stringify(newEmbeddings, null, 2));

  console.log('');
  console.log('='.repeat(80));
  console.log(`✅ Successfully processed ${projects.length} projects`);
  console.log(`📊 Generated: ${generated} embeddings`);
  console.log(`💾 Cached: ${cached} embeddings`);
  console.log(`🧠 Embeddings saved to: ${embeddingsPath}`);
  console.log('='.repeat(80));
}

processProjects().catch(console.error);
