'use client';
import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import FeaturedProjects from '@/components/FeaturedProjects';
import TechBadgeField from '@/components/TechBadgeField';
import ProjectGrid from '@/components/ProjectGrid';
import ProjectSearch from '@/components/ProjectSearch';
import ProjectModal from '@/components/ProjectModal';
import { searchProjects } from '@/utils/projectSearch';

function CodePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Data state
  const [projects, setProjects] = useState([]);
  const [techStack, setTechStack] = useState([]);
  const [embeddings, setEmbeddings] = useState({});
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [techFilters, setTechFilters] = useState([]);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Modal state
  const [selectedProject, setSelectedProject] = useState(null);

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [projectsRes, techRes, embeddingsRes] = await Promise.all([
          fetch('/data/projects.json'),
          fetch('/data/techStack.json'),
          fetch('/data/project-embeddings.json'),
        ]);

        const [projectsData, techData, embeddingsData] = await Promise.all([
          projectsRes.json(),
          techRes.json(),
          embeddingsRes.json(),
        ]);

        setProjects(projectsData);
        setTechStack(techData);
        setEmbeddings(embeddingsData);
      } catch (error) {
        console.error('Failed to load project data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Read from URL on mount (after data loads)
  useEffect(() => {
    if (loading || initialized) return;

    const techParam = searchParams.get('tech');
    const queryParam = searchParams.get('q');

    if (techParam) {
      setTechFilters(techParam.split(','));
    }
    if (queryParam) {
      setSearchQuery(queryParam);
    }

    setInitialized(true);
  }, [loading, searchParams, initialized]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Write to URL on filter change
  useEffect(() => {
    if (!initialized) return; // Don't update URL until initial params are loaded

    const params = new URLSearchParams();
    if (techFilters.length) params.set('tech', techFilters.join(','));
    if (searchQuery) params.set('q', searchQuery);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [techFilters, searchQuery, initialized]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    let result = projects;

    // Apply tech filters
    if (techFilters.length > 0) {
      result = result.filter(project =>
        techFilters.some(tech => project.techStack.includes(tech))
      );
    }

    // Apply search (simple text match for now)
    if (debouncedQuery.trim()) {
      const query = debouncedQuery.toLowerCase();
      result = result.filter(project =>
        project.title.toLowerCase().includes(query) ||
        project.tagline.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.techStack.some(t => t.toLowerCase().includes(query)) ||
        project.category.toLowerCase().includes(query)
      );
    }

    return result;
  }, [projects, techFilters, debouncedQuery]);

  // Active filter count for display
  const activeFilterCount = techFilters.length + (debouncedQuery ? 1 : 0);

  const handleProjectClick = useCallback((project) => {
    setSelectedProject(project);
    document.body.style.overflow = 'hidden';
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedProject(null);
    document.body.style.overflow = '';
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setTechFilters([]);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gray-400">Loading projects...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black">
      <Navbar />

      {/* Hero section - minimal */}
      <section className="pt-24 pb-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Projects
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A collection of things I've built — from full-stack applications to experiments with AI
          </p>
        </div>
      </section>

      {/* Section 1: Featured Projects */}
      <FeaturedProjects
        projects={projects}
        onProjectClick={handleProjectClick}
      />

      {/* Section 2: Tech Stack Badge Field */}
      <TechBadgeField
        techStack={techStack}
        projects={projects}
        onFilterChange={setTechFilters}
        activeFilters={techFilters}
      />

      {/* Section 3: All Projects */}
      <section id="projects-section" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                All Projects
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
                {activeFilterCount > 0 && ' matching filters'}
              </p>
            </div>

            {/* Search */}
            <div className="w-full md:w-96">
              <ProjectSearch
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={() => setSearchQuery('')}
              />
            </div>
          </div>

          {/* Active filters display */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <span className="text-sm text-gray-400">Active filters:</span>
              {techFilters.map(tech => (
                <button
                  key={tech}
                  onClick={() => setTechFilters(prev => prev.filter(t => t !== tech))}
                  className="flex items-center gap-1 px-3 py-1 bg-cyan-600/20 text-cyan-400 rounded-full text-sm hover:bg-cyan-600/30 transition-colors"
                >
                  {tech}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ))}
              {debouncedQuery && (
                <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                  &quot;{debouncedQuery}&quot;
                </span>
              )}
              <button
                onClick={handleClearFilters}
                className="text-sm text-gray-400 hover:text-white underline underline-offset-2"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Project Grid */}
          <ProjectGrid
            projects={filteredProjects}
            onProjectClick={handleProjectClick}
          />
        </div>
      </section>

      {/* Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={handleCloseModal}
          allProjects={projects}
          embeddings={embeddings}
        />
      )}
    </main>
  );
}

export default function CodePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    }>
      <CodePageContent />
    </Suspense>
  );
}
