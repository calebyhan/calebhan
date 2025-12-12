'use client';
import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import Image from 'next/image';

export default function FeaturedProjects({ projects, onProjectClick }) {
  const sectionRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Sort by featuredRank
  const featured = projects
    .filter(p => p.featured)
    .sort((a, b) => a.featuredRank - b.featuredRank)
    .slice(0, 3);

  // Entry animation
  useEffect(() => {
    if (prefersReducedMotion || featured.length === 0) return;

    const cards = sectionRef.current?.querySelectorAll('.featured-card');
    if (!cards || cards.length === 0) return;

    animate(cards, {
      opacity: [0, 1],
      translateY: [40, 0],
      scale: [0.95, 1],
      delay: stagger(150, { start: 200 }),
      duration: 800,
      easing: 'easeOutBack',
    });
  }, [prefersReducedMotion, featured.length]);

  return (
    <section ref={sectionRef} className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-2 text-center">
          Start Here
        </h2>
        <p className="text-gray-400 text-center mb-12">
          My most notable work
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featured.map((project) => (
            <button
              key={project.id}
              className="featured-card opacity-0 group text-left w-full"
              onClick={() => onProjectClick(project)}
            >
              {/* Card structure */}
              <div className="relative overflow-hidden rounded-xl border border-gray-700/50 bg-gray-900/50 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-2">

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
                      <span className="text-4xl">💻</span>
                    </div>
                  )}
                  {/* Featured label overlay */}
                  {project.featuredLabel && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-cyan-600/90 rounded-full text-xs font-medium text-white">
                      {project.featuredLabel}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {project.tagline}
                  </p>

                  {/* Tech pills */}
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.slice(0, 4).map(tech => (
                      <span
                        key={tech}
                        className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.techStack.length > 4 && (
                      <span className="px-2 py-1 text-xs text-gray-500">
                        +{project.techStack.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
