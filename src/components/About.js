"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { animate, utils, stagger } from "animejs";
import Image from "next/image";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export default function About() {
    const introRef = useRef(null);
    const featuredRef = useRef(null);
    const connectRef = useRef(null);

    const [hasAnimated, setHasAnimated] = useState({
        intro: false,
        featured: false,
        connect: false
    });
    const [emailCopied, setEmailCopied] = useState(false);
    const prefersReducedMotion = usePrefersReducedMotion();

    // Animation functions
    const animateIntroSection = useCallback(() => {
        if (!introRef.current) return;

        const headshot = introRef.current.querySelector('[data-animate="headshot"]');
        const text = introRef.current.querySelector('p');

        if (prefersReducedMotion) {
            utils.set(headshot, { opacity: 1, scale: 1 });
            utils.set(text, { opacity: 1, translateY: 0 });
            return;
        }

        animate(headshot, {
            opacity: [0, 1],
            scale: [0.8, 1],
            duration: 800,
            easing: 'easeOutBack'
        });

        animate(text, {
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 800,
            delay: 200,
            easing: 'easeOutCubic'
        });
    }, [prefersReducedMotion]);

    const animateFeaturedSection = useCallback(() => {
        if (!featuredRef.current) return;

        const title = featuredRef.current.querySelector('h2');
        const cards = featuredRef.current.querySelectorAll('.featured-card');

        if (prefersReducedMotion) {
            utils.set(title, { opacity: 1, translateY: 0 });
            utils.set(cards, { opacity: 1, translateY: 0, scale: 1 });
            return;
        }

        animate(title, {
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 600,
            easing: 'easeOutCubic'
        });

        animate(cards, {
            opacity: [0, 1],
            translateY: [40, 0],
            scale: [0.95, 1],
            duration: 800,
            delay: stagger(150, { start: 300 }),
            easing: 'easeOutBack'
        });
    }, [prefersReducedMotion]);

    const animateConnectSection = useCallback(() => {
        if (!connectRef.current) return;

        const title = connectRef.current.querySelector('h2');
        const cards = connectRef.current.querySelectorAll('.contact-button');

        if (prefersReducedMotion) {
            utils.set(title, { opacity: 1, translateY: 0 });
            utils.set(cards, { opacity: 1, translateY: 0, scale: 1 });
            return;
        }

        animate(title, {
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 600,
            easing: 'easeOutCubic'
        });

        animate(cards, {
            opacity: [0, 1],
            translateY: [30, 0],
            scale: [0.9, 1],
            duration: 600,
            delay: stagger(80, { start: 200 }),
            easing: 'easeOutBack'
        });
    }, [prefersReducedMotion]);

    // Intersection Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const target = entry.target;

                        if (target === introRef.current && !hasAnimated.intro) {
                            animateIntroSection();
                            setHasAnimated(prev => ({ ...prev, intro: true }));
                        } else if (target === featuredRef.current && !hasAnimated.featured) {
                            animateFeaturedSection();
                            setHasAnimated(prev => ({ ...prev, featured: true }));
                        } else if (target === connectRef.current && !hasAnimated.connect) {
                            animateConnectSection();
                            setHasAnimated(prev => ({ ...prev, connect: true }));
                        }
                    }
                });
            },
            { threshold: 0.3, rootMargin: '0px 0px -100px 0px' }
        );

        [introRef, featuredRef, connectRef].forEach(ref => {
            if (ref.current) observer.observe(ref.current);
        });

        return () => observer.disconnect();
    }, [hasAnimated, animateIntroSection, animateFeaturedSection, animateConnectSection]);

    // Email copy handler
    const handleCopyEmail = async () => {
        try {
            await navigator.clipboard.writeText('calebhan@unc.edu');
            setEmailCopied(true);
            setTimeout(() => setEmailCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy email:', err);
            const textArea = document.createElement('textarea');
            textArea.value = 'calebhan@unc.edu';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setEmailCopied(true);
            setTimeout(() => setEmailCopied(false), 2000);
        }
    };

    return (
        <section className="min-h-screen text-white relative overflow-hidden">
            {/* Background Image for entire section */}
            <div className="absolute inset-0 overflow-hidden">
                <Image
                    src="/photos/IMG_5067.jpg"
                    alt="Background"
                    fill
                    className="object-cover blur-sm"
                    priority
                />
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Decorative background elements */}
            <div className="absolute inset-0 pointer-events-none z-10">
                <div className="absolute top-1/4 left-10 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse" />
                <div className="absolute top-1/3 right-20 w-1 h-1 bg-cyan-400/40 rounded-full animate-bounce" />
                <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-purple-400/20 rounded-full animate-ping" />
            </div>

            {/* Section 1: Introduction */}
            <section id="about" ref={introRef} className="py-16 px-6 relative z-10">
                <div className="max-w-2xl mx-auto text-center">
                    {/* Headshot Image */}
                    <div className="flex justify-center mb-8 opacity-0" data-animate="headshot">
                        <div className="relative w-48 h-48 md:w-56 md:h-56 group overflow-hidden rounded-full">
                            <Image
                                src="/img/headshot.JPG"
                                alt="Caleb Han headshot"
                                fill
                                className="rounded-full object-cover border-4 border-gray-700/50 shadow-2xl transition-transform duration-300 ease-out group-hover:scale-110"
                            />
                        </div>
                    </div>

                    <p className="text-xl text-gray-300 leading-relaxed antialiased opacity-0">
                        Hey! I&apos;m Caleb, a student at University of North Carolina at Chapel Hill
                        (class of 2028) passionate about photography and coding. I enjoy capturing
                        with my Canon EOS R8 (previously EOS R50) and drones (DJI Mini 4 Pro and
                        DJI Avata 2).
                    </p>
                </div>
            </section>

            {/* Section 2: Featured Work */}
            <section ref={featuredRef} className="py-24 px-6 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 antialiased opacity-0">
                        Featured Work
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Featured Project Card */}
                        <a
                            href="/code?project=good-studio"
                            className="featured-card group bg-gray-900/50 border border-gray-800 rounded-xl p-6
                                     transition-all duration-300 hover:border-cyan-500/50
                                     hover:-translate-y-2 hover:shadow-xl hover:shadow-cyan-500/10 opacity-0"
                        >
                            <div className="aspect-video relative overflow-hidden rounded-lg mb-4">
                                <Image
                                    src="/projects/good-studio/thumb.png"
                                    alt="Good Studio"
                                    fill
                                    className="object-cover transition-transform duration-500
                                             group-hover:scale-105"
                                />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 transition-colors
                                         group-hover:text-cyan-400">
                                Good Studio
                            </h3>
                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                A full-stack application to help small nonprofits launch a
                                professional website in under 2 minutes with AI.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-blue-600/20 border border-blue-400/30
                                               text-blue-300 text-xs rounded-full">
                                    Next.js
                                </span>
                                <span className="px-3 py-1 bg-green-600/20 border border-green-400/30
                                               text-green-300 text-xs rounded-full">
                                    FastAPI
                                </span>
                                <span className="px-3 py-1 bg-purple-600/20 border border-purple-400/30
                                               text-purple-300 text-xs rounded-full">
                                    Supabase
                                </span>
                            </div>
                            <p className="text-cyan-400 text-sm mt-4 flex items-center gap-1">
                                View Project
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M9 5l7 7-7 7" />
                                </svg>
                            </p>
                        </a>

                        {/* Featured Photo Card */}
                        <a
                            href="/photography"
                            className="featured-card group bg-gray-900/50 border border-gray-800 rounded-xl
                                     overflow-hidden transition-all duration-300
                                     hover:border-cyan-500/50 hover:-translate-y-2
                                     hover:shadow-xl hover:shadow-cyan-500/10 cursor-pointer opacity-0"
                        >
                            <div className="aspect-square relative overflow-hidden">
                                <Image
                                    src="/img/about.jpg"
                                    alt="Featured Photo"
                                    fill
                                    className="object-cover transition-transform duration-500
                                             group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/70 opacity-0
                                              group-hover:opacity-100 transition-opacity duration-300
                                              flex flex-col items-center justify-center p-6">
                                    <p className="text-white-300 text-sm text-center mb-4">
                                        KASA MT
                                    </p>
                                    <p className="text-cyan-400 text-sm flex items-center gap-1">
                                        View Portfolio
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M9 5l7 7-7 7" />
                                        </svg>
                                    </p>
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
            </section>

            {/* Section 3: Connect */}
            <section ref={connectRef} className="py-16 px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-12 antialiased opacity-0">
                        Let&apos;s Connect
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {/* LinkedIn */}
                        <a
                            href="https://linkedin.com/in/calebyhan"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contact-button group flex flex-col items-center p-6 bg-gray-900/30
                                     border border-gray-700/50 rounded-xl hover:border-blue-400/50
                                     hover:bg-blue-900/20 transition-all duration-300 opacity-0"
                        >
                            <div className="w-12 h-12 mb-3 flex items-center justify-center bg-blue-600/20
                                          rounded-lg group-hover:bg-blue-500/30 transition-colors">
                                <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-blue-400 group-hover:text-blue-300">
                                LinkedIn
                            </span>
                        </a>

                        {/* GitHub */}
                        <a
                            href="https://github.com/calebyhan"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contact-button group flex flex-col items-center p-6 bg-gray-900/30
                                     border border-gray-700/50 rounded-xl hover:border-purple-400/50
                                     hover:bg-purple-900/20 transition-all duration-300 opacity-0"
                        >
                            <div className="w-12 h-12 mb-3 flex items-center justify-center bg-gray-600/20
                                          rounded-lg group-hover:bg-purple-500/30 transition-colors">
                                <svg className="w-6 h-6 text-gray-300 group-hover:text-purple-300"
                                     fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-300 group-hover:text-purple-300">
                                GitHub
                            </span>
                        </a>

                        {/* Instagram */}
                        <a
                            href="https://instagram.com/calebyhan"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contact-button group flex flex-col items-center p-6 bg-gray-900/30
                                     border border-gray-700/50 rounded-xl hover:border-pink-400/50
                                     hover:bg-pink-900/20 transition-all duration-300 opacity-0"
                        >
                            <div className="w-12 h-12 mb-3 flex items-center justify-center
                                          bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg
                                          group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all">
                                <svg className="w-6 h-6 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-pink-400 group-hover:text-pink-300">
                                Instagram
                            </span>
                        </a>

                        {/* Email */}
                        <button
                            onClick={handleCopyEmail}
                            className="contact-button group flex flex-col items-center p-6 bg-gray-900/30
                                     border border-gray-700/50 rounded-xl cursor-pointer
                                     hover:border-cyan-400/50 hover:bg-cyan-900/20
                                     transition-all duration-300 relative opacity-0"
                        >
                            <div className="w-12 h-12 mb-3 flex items-center justify-center bg-cyan-600/20
                                          rounded-lg group-hover:bg-cyan-500/30 transition-colors">
                                {emailCopied ? (
                                    <svg className="w-6 h-6 text-green-400" fill="none"
                                         stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                              strokeWidth={2} d="M5 13l4 4L19 7"/>
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6 text-cyan-400" fill="none"
                                         stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                    </svg>
                                )}
                            </div>
                            <span className="text-sm font-medium text-cyan-400 group-hover:text-cyan-300">
                                {emailCopied ? 'Copied!' : 'Copy Email'}
                            </span>
                        </button>
                    </div>
                </div>
            </section>
        </section>
    );
}
