'use client';
import { useMemo } from 'react';

const CATEGORY_CONFIG = {
  language: { label: 'Languages', accent: '#f59e0b' },
  frontend: { label: 'Frontend',  accent: '#22d3ee' },
  backend:  { label: 'Backend',   accent: '#a78bfa' },
  ai:       { label: 'AI / ML',   accent: '#34d399' },
  database: { label: 'Database',  accent: '#fb7185' },
  tools:    { label: 'Tools',     accent: '#94a3b8' },
};

const CATEGORY_ORDER = ['language', 'frontend', 'backend', 'ai', 'database', 'tools'];

export default function TechBadgeField({ techStack, projects, onFilterChange, activeFilters = [] }) {
  const techCounts = useMemo(() => {
    const counts = {};
    techStack.forEach(tech => {
      counts[tech.id] = projects.filter(p => p.techStack.includes(tech.id)).length;
    });
    return counts;
  }, [techStack, projects]);

  const categories = useMemo(() => {
    const groups = {};
    techStack.forEach(tech => {
      const cat = tech.category === 'devops' ? 'tools' : tech.category;
      if (!groups[cat]) groups[cat] = [];
      if (techCounts[tech.id] > 0) groups[cat].push(tech);
    });
    return CATEGORY_ORDER
      .filter(cat => groups[cat]?.length > 0)
      .map(cat => ({ category: cat, config: CATEGORY_CONFIG[cat], techs: groups[cat] }));
  }, [techStack, techCounts]);

  const handleBadgeClick = (techId) => {
    const newFilters = activeFilters.includes(techId)
      ? activeFilters.filter(t => t !== techId)
      : [...activeFilters, techId];
    onFilterChange(newFilters);
    setTimeout(() => {
      document.getElementById('projects-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <section className="py-16 px-4 border-y border-gray-800/50">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-baseline justify-between mb-10">
          <div>
            <h2 className="text-2xl font-semibold text-white">Tech Stack</h2>
            <p className="text-gray-500 text-sm mt-1">Click to filter projects by technology</p>
          </div>
          {activeFilters.length > 0 && (
            <button
              onClick={() => onFilterChange([])}
              className="text-sm text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors flex-shrink-0"
            >
              Clear {activeFilters.length} filter{activeFilters.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>

        {/* Category rows */}
        <div className="divide-y divide-gray-800/50">
          {categories.map(({ category, config, techs }) => {
            const hasActive = techs.some(t => activeFilters.includes(t.id));
            return (
              <div
                key={category}
                className="grid grid-cols-[6rem_1fr] sm:grid-cols-[8rem_1fr] gap-4 sm:gap-8 py-5 items-start"
              >
                {/* Category label with colored left border */}
                <div className="flex items-start gap-2.5 pt-0.5">
                  <div
                    className="w-0.5 h-5 flex-shrink-0 rounded-full transition-opacity duration-300 mt-0.5"
                    style={{
                      backgroundColor: config.accent,
                      opacity: hasActive ? 1 : 0.35,
                    }}
                  />
                  <span
                    className="text-xs font-mono font-semibold uppercase tracking-widest leading-tight transition-colors duration-300"
                    style={{ color: hasActive ? config.accent : `${config.accent}80` }}
                  >
                    {config.label}
                  </span>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {techs.map(tech => {
                    const isActive = activeFilters.includes(tech.id);
                    return (
                      <button
                        key={tech.id}
                        onClick={() => handleBadgeClick(tech.id)}
                        className={`
                          flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm
                          border transition-all duration-150
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40 focus-visible:ring-offset-1 focus-visible:ring-offset-black
                          ${isActive
                            ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/15 font-medium'
                            : 'bg-gray-900/60 text-gray-400 border-gray-800 hover:text-gray-200 hover:border-gray-600 hover:bg-gray-800/60 font-normal'
                          }
                        `}
                        aria-pressed={isActive}
                      >
                        {tech.label}
                        <span className={`text-xs tabular-nums ${isActive ? 'text-cyan-400/60' : 'text-gray-600'}`}>
                          {techCounts[tech.id]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
