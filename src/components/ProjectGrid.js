'use client';
import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import Image from 'next/image';

export default function ProjectGrid({ projects, onProjectClick }) {
  const gridRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const prevCountRef = useRef(projects.length);

  // Animate on filter change
  useEffect(() => {
    if (prefersReducedMotion) return;

    const cards = gridRef.current?.querySelectorAll('.project-card');
    if (!cards || cards.length === 0) return;

    animate(cards, {
      opacity: [0, 1],
      translateY: [20, 0],
      delay: stagger(50, { start: 0 }),
      duration: 400,
      easing: 'easeOutCubic',
    });

    prevCountRef.current = projects.length;
  }, [projects, prefersReducedMotion]);

  if (projects.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg mb-2">No projects match your filters</p>
        <p className="text-sm">Try adjusting your search or clearing filters</p>
      </div>
    );
  }

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {projects.map((project) => (
        <button
          key={project.id}
          className="project-card opacity-0 text-left group w-full"
          onClick={() => onProjectClick(project)}
        >
          <div className="h-full rounded-xl border border-gray-800 bg-gray-900/30 overflow-hidden transition-all duration-300 hover:border-gray-700 hover:bg-gray-900/50 hover:-translate-y-1 hover:shadow-xl">
            {/* Thumbnail */}
            <div className="aspect-video relative overflow-hidden bg-gray-800">
              {project.images?.thumbnail ? (
                <Image
                  src={project.images.thumbnail}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                  <span className="text-4xl">📁</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                {project.title}
              </h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {project.tagline}
              </p>

              {/* Tech stack */}
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.slice(0, 3).map(tech => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 text-xs bg-gray-800 text-gray-400 rounded"
                  >
                    {tech}
                  </span>
                ))}
                {project.techStack.length > 3 && (
                  <span className="px-2 py-0.5 text-xs text-gray-500">
                    +{project.techStack.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
