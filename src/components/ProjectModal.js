'use client';
import { useEffect, useRef, useState, useMemo } from 'react';
import { animate } from 'animejs';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cosineSimilarity } from '@/utils/projectSearch';
import Image from 'next/image';

export default function ProjectModal({ project, onClose, allProjects, embeddings }) {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [activeImage, setActiveImage] = useState(0);

  // Entry animation
  useEffect(() => {
    if (prefersReducedMotion) return;

    animate(overlayRef.current, {
      opacity: [0, 1],
      duration: 200,
      easing: 'easeOutCubic',
    });

    animate(contentRef.current, {
      opacity: [0, 1],
      scale: [0.95, 1],
      translateY: [20, 0],
      duration: 300,
      delay: 100,
      easing: 'easeOutCubic',
    });
  }, [prefersReducedMotion]);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Calculate similar projects using cosine similarity
  const similarProjects = useMemo(() => {
    if (!embeddings || !embeddings[project.id]) return [];

    const currentEmbedding = embeddings[project.id];

    const similarities = allProjects
      .filter(p => p.id !== project.id && embeddings[p.id])
      .map(p => {
        const similarity = cosineSimilarity(currentEmbedding, embeddings[p.id]);
        return { project: p, similarity };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);

    return similarities.map(s => s.project);
  }, [project, allProjects, embeddings]);

  const images = useMemo(() => {
    const allImages = [];

    // Add thumbnail as the first image
    if (project.images?.thumbnail) {
      allImages.push(project.images.thumbnail);
    }

    // Add screenshots after thumbnail
    if (project.images?.screenshots?.length > 0) {
      allImages.push(...project.images.screenshots);
    }

    return allImages;
  }, [project]);

  const handleOverlayClick = (e) => {
    // Only close if clicking directly on the overlay, not on the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm overflow-y-auto"
      onClick={handleOverlayClick}
    >
      <div className="min-h-full flex items-start justify-center p-4 py-8" onClick={handleOverlayClick}>
        <div
          ref={contentRef}
          className="w-full max-w-4xl bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with close button */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <h2 className="text-2xl font-bold text-white">{project.title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Image gallery */}
          {images.length > 0 && (
            <div className="relative">
              <div className="aspect-video relative bg-gray-800">
                <Image
                  src={images[activeImage]}
                  alt={`${project.title} screenshot ${activeImage + 1}`}
                  fill
                  className="object-contain"
                />
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 p-4 bg-gray-950/50 overflow-x-auto">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`relative w-20 h-14 rounded overflow-hidden flex-shrink-0 border-2 transition-colors ${
                        i === activeImage ? 'border-cyan-500' : 'border-transparent'
                      }`}
                    >
                      <Image src={img} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Tagline */}
            <p className="text-xl text-gray-300">{project.tagline}</p>

            {/* Links */}
            <div className="flex gap-4">
              {project.links?.github && (
                <a
                  href={project.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  GitHub
                </a>
              )}
              {project.links?.live && (
                <a
                  href={project.links.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Live Demo
                </a>
              )}
            </div>

            {/* Description */}
            <div className="prose prose-invert prose-gray max-w-none">
              <p className="text-gray-300 whitespace-pre-line">{project.description}</p>
            </div>

            {/* Tech stack */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">Built with</h3>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map(tech => (
                  <span
                    key={tech}
                    className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-full text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div className="flex gap-6 text-sm text-gray-400">
              {project.metadata?.year && (
                <span>Year: {project.metadata.year}</span>
              )}
              {project.metadata?.status && (
                <span className="capitalize">Status: {project.metadata.status}</span>
              )}
            </div>

            {/* Similar projects */}
            {similarProjects.length > 0 && (
              <div className="pt-6 border-t border-gray-800">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Similar Projects</h3>
                <div className="grid grid-cols-3 gap-4">
                  {similarProjects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onClose();
                        // Small delay to allow modal close animation
                        setTimeout(() => {
                          // This will be handled by parent component
                          // For now, we just close the current modal
                        }, 100);
                      }}
                      className="text-left p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <p className="text-white font-medium truncate">{p.title}</p>
                      <p className="text-gray-400 text-xs truncate">{p.tagline}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
