"use client";

import { useEffect, useRef, useState } from "react";
import { utils } from "animejs";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export default function SVGScrollReveal() {
    const containerRef = useRef(null);
    const svgLayerRef = useRef(null);
    const photoLayerRef = useRef(null);
    const prefersReducedMotion = usePrefersReducedMotion();
    const [isMobile, setIsMobile] = useState(false);

    // Mobile detection
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Scroll animation logic
    useEffect(() => {
        if (!containerRef.current || !svgLayerRef.current || !photoLayerRef.current) return;

        // Accessibility: Skip animation if user prefers reduced motion
        if (prefersReducedMotion) {
            utils.set(svgLayerRef.current, {
                clipPath: 'inset(0 0 0% 0)',
                opacity: 0
            });
            utils.set(photoLayerRef.current, { opacity: 1 });
            return;
        }

        const handleScroll = () => {
            const rect = containerRef.current.getBoundingClientRect();
            const containerHeight = containerRef.current.offsetHeight;
            const viewportHeight = window.innerHeight;

            // Calculate progress: Start as soon as top of container reaches top of viewport
            // 0 = container top at viewport top (rect.top = 0)
            // 1 = container bottom at viewport bottom (rect.top = -(containerHeight - viewportHeight))
            const scrollStart = 0;
            const scrollEnd = -(containerHeight - viewportHeight);
            const scrollDistance = scrollStart - scrollEnd;

            const rawProgress = Math.max(0, Math.min(1, (scrollStart - rect.top) / scrollDistance));

            if (rawProgress <= 0.8) {
                // Phase 1: SVG reveal via clip-path (top to bottom)
                // When progress = 0: insetBottom = 100% (bottom fully clipped, only sky visible)
                // When progress = 0.8: insetBottom = 0% (fully visible)
                const svgProgress = rawProgress / 0.8;
                const insetBottom = 100 - (svgProgress * 100);

                utils.set(svgLayerRef.current, {
                    clipPath: `inset(0 0 ${insetBottom}% 0)`,
                    opacity: 1
                });
                utils.set(photoLayerRef.current, { opacity: 0 });
            } else {
                // Phase 2: Crossfade to photo
                const fadeProgress = (rawProgress - 0.8) / 0.2;

                utils.set(svgLayerRef.current, {
                    clipPath: 'inset(0 0 0% 0)',
                    opacity: 1 - fadeProgress
                });
                utils.set(photoLayerRef.current, { opacity: fadeProgress });
            }
        };

        // RAF throttling for 60fps
        let rafId = null;
        let isScrolling = false;

        const onScroll = () => {
            if (!isScrolling) {
                isScrolling = true;
                rafId = requestAnimationFrame(() => {
                    handleScroll();
                    isScrolling = false;
                });
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        handleScroll(); // Initial call

        return () => {
            window.removeEventListener('scroll', onScroll);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [prefersReducedMotion]);

    return (
        <section
            ref={containerRef}
            className={`relative ${isMobile ? 'h-[150vh]' : 'h-[200vh]'} m-0 p-0`}
            aria-label="About hero"
        >
            <div className="sticky top-0 h-screen w-full overflow-hidden bg-black m-0 p-0">
                {/* Photo layer - background */}
                <div
                    ref={photoLayerRef}
                    className="absolute inset-0 opacity-0"
                    style={{
                        backgroundImage: "url(/img/about.jpg)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat"
                    }}
                />

                {/* SVG layer - foreground with clip-path */}
                <div
                    ref={svgLayerRef}
                    className="absolute inset-0 opacity-100"
                    style={{
                        backgroundImage: "url(/img/about.svg)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        clipPath: 'inset(0 0 100% 0)',
                        willChange: 'clip-path, opacity'
                    }}
                />

                {/* Scroll hint */}
                {!prefersReducedMotion && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none">
                        <div className="text-white/60 text-sm animate-bounce">Scroll</div>
                    </div>
                )}
            </div>
        </section>
    );
}
