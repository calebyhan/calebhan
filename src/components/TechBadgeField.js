'use client';
import { useRef, useState, useEffect, useMemo } from 'react';
import { animate } from 'animejs';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export default function TechBadgeField({
  techStack,
  projects,
  onFilterChange,
  activeFilters = []
}) {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isMobile, setIsMobile] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Count projects per tech
  const techCounts = useMemo(() => {
    const counts = {};
    techStack.forEach(tech => {
      counts[tech.id] = projects.filter(p =>
        p.techStack.includes(tech.id)
      ).length;
    });
    return counts;
  }, [techStack, projects]);

  // Filter to only techs that have projects
  const activeTechStack = techStack.filter(tech => techCounts[tech.id] > 0);

  // Mouse tracking
  useEffect(() => {
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      setMousePos({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    };

    const handleMouseLeave = () => {
      setMousePos({ x: 0.5, y: 0.5 });
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [prefersReducedMotion]);

  // Floating animation
  useEffect(() => {
    if (prefersReducedMotion) return;

    const badges = containerRef.current?.querySelectorAll('.tech-badge');
    if (!badges) return;

    const animations = Array.from(badges).map((badge, i) => {
      return animate(badge, {
        translateY: [0, -6 - Math.random() * 6, 0],
        duration: 2500 + Math.random() * 1500,
        easing: 'easeInOutSine',
        loop: true,
        delay: i * 80 + Math.random() * 400,
      });
    });

    return () => animations.forEach(a => a.pause());
  }, [prefersReducedMotion, activeTechStack.length]);

  const handleBadgeClick = (techId) => {
    const newFilters = activeFilters.includes(techId)
      ? activeFilters.filter(t => t !== techId)
      : [...activeFilters, techId];

    onFilterChange(newFilters);

    // Scroll to projects section
    setTimeout(() => {
      document.getElementById('projects-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  };

  const clearFilters = () => {
    onFilterChange([]);
  };

  return (
    <section className="py-16 px-4 border-y border-gray-800/50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold text-white mb-2 text-center">
          Tech Stack
        </h2>
        <p className="text-gray-400 text-center mb-4 text-sm">
          Click to filter projects
        </p>

        {/* Clear filters button */}
        {activeFilters.length > 0 && (
          <div className="text-center mb-6">
            <button
              onClick={clearFilters}
              className="text-sm text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
            >
              Clear filters ({activeFilters.length} active)
            </button>
          </div>
        )}

        {/* Badge field - mobile: horizontal scroll, desktop: floating field */}
        {isMobile ? (
          <div className="flex gap-2 overflow-x-auto pb-4 px-4 -mx-4 scrollbar-hide">
            {activeTechStack.map(tech => (
              <button
                key={tech.id}
                onClick={() => handleBadgeClick(tech.id)}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap
                  border transition-all duration-200
                  ${activeFilters.includes(tech.id)
                    ? 'bg-cyan-600 text-white border-cyan-500'
                    : 'bg-gray-900/80 text-gray-300 border-gray-700/50'
                  }
                `}
              >
                {tech.label}
                {techCounts[tech.id] > 0 && (
                  <span className={`ml-1.5 text-xs ${activeFilters.includes(tech.id) ? 'text-cyan-200' : 'text-gray-500'}`}>
                    ({techCounts[tech.id]})
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div
            ref={containerRef}
            className="relative h-64 md:h-72 lg:h-80"
          >
            {activeTechStack.map((tech, index) => (
              <TechBadge
                key={tech.id}
                tech={tech}
                index={index}
                totalCount={activeTechStack.length}
                mousePos={mousePos}
                isActive={activeFilters.includes(tech.id)}
                projectCount={techCounts[tech.id]}
                onClick={() => handleBadgeClick(tech.id)}
                reducedMotion={prefersReducedMotion}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function TechBadge({
  tech,
  index,
  totalCount,
  mousePos,
  isActive,
  projectCount,
  onClick,
  reducedMotion,
}) {
  // Calculate scattered position
  const basePosition = useMemo(() => {
    const cols = Math.ceil(Math.sqrt(totalCount * 1.5));
    const row = Math.floor(index / cols);
    const col = index % cols;
    const totalRows = Math.ceil(totalCount / cols);

    // Deterministic "random" jitter based on tech id
    const seed = tech.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const jitterX = ((seed * 13) % 20) - 10;
    const jitterY = ((seed * 17) % 16) - 8;

    const baseX = cols > 1 ? (col / (cols - 1)) * 70 : 35;
    const baseY = totalRows > 1 ? (row / (totalRows - 1)) * 60 : 30;

    return {
      left: `${15 + baseX + jitterX}%`,
      top: `${20 + baseY + jitterY}%`,
    };
  }, [index, totalCount, tech.id]);

  // Parallax offset
  const parallaxOffset = useMemo(() => {
    if (reducedMotion) return { x: 0, y: 0 };

    const depth = tech.depth || 1;
    const maxOffset = 15 * depth;

    return {
      x: (mousePos.x - 0.5) * maxOffset * 2,
      y: (mousePos.y - 0.5) * maxOffset * 2,
    };
  }, [mousePos, tech.depth, reducedMotion]);

  return (
    <button
      className={`
        tech-badge absolute px-4 py-2 rounded-full
        font-medium text-sm whitespace-nowrap
        transition-all duration-300 ease-out
        border
        focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-black
        ${isActive
          ? 'bg-cyan-600 text-white border-cyan-500 shadow-lg shadow-cyan-500/30 scale-110'
          : 'bg-gray-900/80 text-gray-300 border-gray-700/50 hover:text-white hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-110'
        }
      `}
      style={{
        ...basePosition,
        transform: `translate(${parallaxOffset.x}px, ${parallaxOffset.y}px)`,
        opacity: reducedMotion ? 1 : (0.7 + (tech.depth || 1) * 0.25),
        zIndex: isActive ? 50 : Math.round((tech.depth || 1) * 10),
      }}
      onClick={onClick}
      aria-pressed={isActive}
    >
      {tech.label}
      {projectCount > 0 && (
        <span className={`ml-1.5 text-xs ${isActive ? 'text-cyan-200' : 'text-gray-500'}`}>
          ({projectCount})
        </span>
      )}
    </button>
  );
}
