"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { animate, createTimeline, utils, stagger } from "animejs";
import Image from "next/image";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import SVGScrollReveal from "./SVGScrollReveal";

export default function About() {
    const sectionRef = useRef(null);
    const aboutRef = useRef(null);
    const skillsRef = useRef(null);
    const projectsRef = useRef(null);
    const contactRef = useRef(null);
    const [hasAnimated, setHasAnimated] = useState({
        about: false,
        skills: false,
        projects: false,
        contact: false
    });
    const [emailCopied, setEmailCopied] = useState(false);
    const prefersReducedMotion = usePrefersReducedMotion();

    const animateAboutSection = useCallback(() => {
        if (prefersReducedMotion) {
            // Show immediately without animation
            utils.set(aboutRef.current.querySelector('h2'), { opacity: 1, translateY: 0, scale: 1 });
            utils.set(aboutRef.current.querySelector('p'), { opacity: 1, translateY: 0 });
            utils.set(aboutRef.current.querySelector('div.relative'), { opacity: 1, scale: 1, rotateY: 0 });
            return;
        }

        const tl = createTimeline();

        tl.add(aboutRef.current.querySelector('h2'), {
            opacity: [0, 1],
            translateY: [50, 0],
            scale: [0.8, 1],
            duration: 1000
        })
        .add(aboutRef.current.querySelector('p'), {
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 800
        }, 400)
        .add(aboutRef.current.querySelector('div.relative'), {
            opacity: [0, 1],
            scale: [0.8, 1],
            rotateY: [90, 0],
            duration: 1000
        }, 600);
    }, [prefersReducedMotion]);

    const animateSkillsSection = useCallback(() => {
        const skillCards = skillsRef.current.querySelectorAll('.skill-card');
        const tags = skillsRef.current.querySelectorAll('.skill-tag');

        if (prefersReducedMotion) {
            // Show immediately without animation
            utils.set(skillCards, { opacity: 1, translateY: 0, rotateX: 0, scale: 1 });
            utils.set(tags, { opacity: 1, scale: 1, rotateZ: 0 });
            return;
        }

        utils.set(skillCards, {
            opacity: 0,
            translateY: 50,
            rotateX: 45
        });

        animate(skillCards, {
            opacity: [0, 1],
            translateY: [50, 0],
            rotateX: [45, 0],
            scale: [0.8, 1],
            duration: 800,
            delay: stagger(200),
            easing: 'easeOutElastic(1, .8)'
        });

        setTimeout(() => {
            animate(tags, {
                scale: [0, 1],
                opacity: [0, 1],
                rotateZ: [180, 0],
                duration: 600,
                delay: stagger(50, {start: 300}),
                easing: 'easeOutBack(1.7)'
            });
        }, 400);
    }, [prefersReducedMotion]);

    const animateProjectsSection = useCallback(() => {
        const projectTitle = projectsRef.current.querySelector('h2');
        const projectCards = projectsRef.current.querySelectorAll('.project-card');

        if (prefersReducedMotion) {
            // Show immediately without animation
            utils.set(projectCards, { opacity: 1, scale: 1, rotateY: 0 });
            return;
        }

        const titleText = projectTitle.textContent;
        projectTitle.innerHTML = titleText.split('').map(char =>
            char === ' ' ? ' ' : `<span class="project-letter inline-block">${char}</span>`
        ).join('');

        animate('.project-letter', {
            opacity: [0, 1],
            translateY: [30, 0],
            rotateY: [90, 0],
            duration: 600,
            delay: stagger(50),
            easing: 'easeOutBack(1.7)'
        });

        utils.set(projectCards, {
            opacity: 0,
            scale: 0.3,
            rotateY: 180
        });

        animate(projectCards, {
            opacity: [0, 1],
            scale: [0.3, 1],
            rotateY: [180, 0],
            duration: 1000,
            delay: stagger(300, {start: 500}),
            easing: 'easeOutElastic(1, .6)'
        });
    }, [prefersReducedMotion]);

    const animateContactSection = useCallback(() => {
        const contactTitle = contactRef.current.querySelector('h2');
        const contactSubtitle = contactRef.current.querySelector('p');
        const socialLinks = contactRef.current.querySelectorAll('.contact-button');

        if (prefersReducedMotion) {
            // Show immediately without animation
            utils.set(contactTitle, { opacity: 1, translateY: 0, scale: 1 });
            utils.set(contactSubtitle, { opacity: 1, translateY: 0 });
            utils.set(socialLinks, { opacity: 1, translateY: 0, scale: 1, rotateY: 0 });
            return;
        }

        const tl = createTimeline();

        tl.add(contactTitle, {
            opacity: [0, 1],
            translateY: [40, 0],
            scale: [0.9, 1],
            duration: 800
        })
        .add(contactSubtitle, {
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 600
        }, 200)
        .add(socialLinks, {
            opacity: [0, 1],
            translateY: [30, 0],
            scale: [0.8, 1],
            rotateY: [90, 0],
            duration: 700,
            delay: stagger(100)
        }, 400);
    }, [prefersReducedMotion]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const target = entry.target;

                        if (target === aboutRef.current && !hasAnimated.about) {
                            animateAboutSection();
                            setHasAnimated(prev => ({ ...prev, about: true }));
                        } else if (target === skillsRef.current && !hasAnimated.skills) {
                            animateSkillsSection();
                            setHasAnimated(prev => ({ ...prev, skills: true }));
                        } else if (target === projectsRef.current && !hasAnimated.projects) {
                            animateProjectsSection();
                            setHasAnimated(prev => ({ ...prev, projects: true }));
                        } else if (target === contactRef.current && !hasAnimated.contact) {
                            animateContactSection();
                            setHasAnimated(prev => ({ ...prev, contact: true }));
                        }
                    }
                });
            },
            {
                threshold: 0.3,
                rootMargin: '0px 0px -100px 0px'
            }
        );

        [aboutRef, skillsRef, projectsRef, contactRef].forEach(ref => {
            if (ref.current) observer.observe(ref.current);
        });

        return () => observer.disconnect();
    }, [hasAnimated, animateAboutSection, animateContactSection, animateProjectsSection, animateSkillsSection]);

    const handleSkillCardHover = (e) => {
        animate(e.currentTarget, {
            scale: 1.05,
            rotateY: 5,
            duration: 300,
            easing: 'easeOutQuart'
        });

        const tags = e.currentTarget.querySelectorAll('.skill-tag');
        animate(tags, {
            scale: [1, 1.1],
            rotateZ: () => utils.random(-5, 5),
            duration: 200,
            delay: stagger(30),
            complete: () => {
                animate(tags, {
                    scale: 1,
                    rotateZ: 0,
                    duration: 400
                });
            }
        });
    };

    const handleSkillCardLeave = (e) => {
        animate(e.currentTarget, {
            scale: 1,
            rotateY: 0,
            duration: 400,
            easing: 'easeOutElastic(1, .8)'
        });
    };

    const handleProjectCardHover = (e) => {
        animate(e.currentTarget, {
            scale: 1.02,
            rotateX: 2,
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            duration: 300
        });
    };

    const handleProjectCardLeave = (e) => {
        animate(e.currentTarget, {
            scale: 1,
            rotateX: 0,
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
            duration: 400
        });
    };

    const handleCopyEmail = async () => {
        try {
            await navigator.clipboard.writeText('calebhan@unc.edu');
            setEmailCopied(true);
            setTimeout(() => setEmailCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy email:', err);
            // Fallback for older browsers
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
        <>
            {/* Hero section - completely separate, no gap */}
            {/* <SVGScrollReveal /> */}

            <section
                ref={sectionRef}
                className="min-h-screen bg-black text-white relative overflow-hidden"
            >
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-10 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse" />
                    <div className="absolute top-1/3 right-20 w-1 h-1 bg-cyan-400/40 rounded-full animate-bounce" />
                    <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-purple-400/20 rounded-full animate-ping" />
                </div>

                <div className="mx-auto max-w-4xl px-6 space-y-24 py-24">
                <div ref={aboutRef} className="text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 antialiased opacity-0">
                        About Me
                    </h2>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto antialiased leading-relaxed opacity-0 mb-8">
                        Hey! I&apos;m Caleb, a student at University of North Carolina at Chapel Hill (class of 2028)
                        passionate about <strong>photography</strong> and <strong>coding</strong>. I enjoy capturing
                        with my Canon EOS R8 (previously EOS R50) and drones (DJI Mini 4 Pro and DJI Avata 2).
                    </p>
                    
                    {/* Headshot Image */}
                    <div className="flex justify-center mb-8">
                        <div className="relative w-48 h-48 md:w-56 md:h-56 opacity-0 group overflow-hidden rounded-full">
                            <Image
                                src="/img/headshot.JPG"
                                alt="Caleb Han headshot"
                                fill
                                className="rounded-full object-cover border-4 border-gray-700/50 shadow-2xl transition-transform duration-300 ease-out group-hover:scale-150"
                            />
                        </div>
                    </div>
                </div>

                <div ref={skillsRef} className="grid md:grid-cols-2 gap-12">
                    <div 
                        className="skill-card space-y-6 p-6 rounded-lg bg-gray-900/20 backdrop-blur-sm border border-gray-800/50"
                        onMouseEnter={handleSkillCardHover}
                        onMouseLeave={handleSkillCardLeave}
                    >
                        <h3 className="text-2xl md:text-3xl font-semibold text-white antialiased">
                            Development
                        </h3>
                        <p className="text-gray-300 text-lg leading-relaxed antialiased">
                            I build projects for hackathons, personal use, and learning. I try to integrate modern web
                            tools and frameworks to keep up with the fast-evolving web development landscape. Right now,
                            I am trying to learn more about AI/ML and research. Look into my <a
                                href="https://github.com/calebyhan" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-white hover:text-blue-300 underline decoration-blue-400/50 hover:decoration-blue-300 underline-offset-2 transition-colors duration-200"
                            >
                                GitHub
                            </a> for what I&apos;m currently working on!
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <span className="skill-tag px-4 py-2 bg-blue-600/20 border border-blue-400/30 text-blue-300 text-sm rounded-full">React</span>
                            <span className="skill-tag px-4 py-2 bg-green-600/20 border border-green-400/30 text-green-300 text-sm rounded-full">Next.js</span>
                            <span className="skill-tag px-4 py-2 bg-purple-600/20 border border-purple-400/30 text-purple-300 text-sm rounded-full">Supabase</span>
                        </div>
                    </div>

                    <div 
                        className="skill-card space-y-6 p-6 rounded-lg bg-gray-900/20 backdrop-blur-sm border border-gray-800/50"
                        onMouseEnter={handleSkillCardHover}
                        onMouseLeave={handleSkillCardLeave}
                    >
                        <h3 className="text-2xl md:text-3xl font-semibold text-white antialiased">
                            Photography
                        </h3>
                        <p className="text-gray-300 text-lg leading-relaxed antialiased">
                            Through my camera, I try to benefit my immediate community and friends with my time and
                            skills. I primarily work with campus organizations to capture events and portraits, but I
                            also enjoy capturing landscapes in my free time. I try to integrate my drones to include
                            aerial perspectives in my work.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <span className="skill-tag px-4 py-2 bg-amber-600/20 border border-amber-400/30 text-amber-300 text-sm rounded-full">Landscape</span>
                            <span className="skill-tag px-4 py-2 bg-teal-600/20 border border-teal-400/30 text-teal-300 text-sm rounded-full">Portraits</span>
                            <span className="skill-tag px-4 py-2 bg-red-600/20 border border-red-400/30 text-red-300 text-sm rounded-full">Events</span>
                        </div>
                    </div>
                </div>

                <div ref={projectsRef}>
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 antialiased">
                        Recent Projects
                    </h2>

                    <div className="grid gap-8">
                        <a
                            href="/code?project=good-studio"
                            className="project-card bg-gray-900/50 border border-gray-800 backdrop-blur-sm p-8 rounded-xl transition-colors cursor-pointer block hover:border-gray-700"
                            onMouseEnter={handleProjectCardHover}
                            onMouseLeave={handleProjectCardLeave}
                        >
                            <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-white antialiased">
                                Good Studio
                            </h3>
                            <p className="text-gray-300 mb-6 text-lg leading-relaxed antialiased">
                                A full-stack application built with Next.js, FastAPI, Google Gemini, and Supabase to help small nonprofits and community organizations
                                launch a professional website in under 2 minutes with AI-generated branding, copy, and accessibility checks.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <span className="px-4 py-2 bg-blue-600/20 border border-blue-400/30 text-blue-300 text-sm rounded-full">Next.js</span>
                                <span className="px-4 py-2 bg-green-600/20 border border-green-400/30 text-green-300 text-sm rounded-full">FastAPI</span>
                                <span className="px-4 py-2 bg-purple-600/20 border border-purple-400/30 text-purple-300 text-sm rounded-full">Supabase</span>
                            </div>
                        </a>

                        <a
                            href="/photography?trip=Scandinavia+2025"
                            className="project-card bg-gray-900/50 border border-gray-800 backdrop-blur-sm p-8 rounded-xl transition-colors cursor-pointer block hover:border-gray-700"
                            onMouseEnter={handleProjectCardHover}
                            onMouseLeave={handleProjectCardLeave}
                        >
                            <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-white antialiased">
                                Scandinavia
                            </h3>
                            <p className="text-gray-300 mb-6 text-lg leading-relaxed antialiased">
                                A collection of my favorite photos from my trip to Scandinavia. Visited for Study Abroad
                                with UNC and DIS in Summer 2025 to explore Denmark, Sweden, and Norway. Some additional
                                photos from London.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <span className="px-4 py-2 bg-amber-600/20 border border-amber-400/30 text-amber-300 text-sm rounded-full">Landscape</span>
                                <span className="px-4 py-2 bg-teal-600/20 border border-teal-400/30 text-teal-300 text-sm rounded-full">City</span>
                                <span className="px-4 py-2 bg-red-600/20 border border-red-400/30 text-red-300 text-sm rounded-full">Travel</span>
                            </div>
                        </a>
                    </div>
                </div>

                <div ref={contactRef} className="text-center pt-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8 antialiased opacity-0">
                        Socials and Contact
                    </h2>
                    
                    {/* Social Media Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-4xl mx-auto mb-12">
                        {/* LinkedIn */}
                        <a 
                            href="https://linkedin.com/in/calebyhan"
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="contact-button group flex flex-col items-center p-6 bg-gray-900/30 border border-gray-700/50 rounded-xl hover:border-blue-400/50 hover:bg-blue-900/20 transition-all duration-300 opacity-0"
                        >
                            <div className="w-12 h-12 mb-3 flex items-center justify-center bg-blue-600/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                                <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-blue-400 group-hover:text-blue-300">LinkedIn</span>
                        </a>

                        {/* GitHub */}
                        <a 
                            href="https://github.com/calebyhan"
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="contact-button group flex flex-col items-center p-6 bg-gray-900/30 border border-gray-700/50 rounded-xl hover:border-purple-400/50 hover:bg-purple-900/20 transition-all duration-300 opacity-0"
                        >
                            <div className="w-12 h-12 mb-3 flex items-center justify-center bg-gray-600/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                                <svg className="w-6 h-6 text-gray-300 group-hover:text-purple-300" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-300 group-hover:text-purple-300">GitHub</span>
                        </a>

                        {/* Instagram Main */}
                        <a 
                            href="https://instagram.com/calebyhan"
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="contact-button group flex flex-col items-center p-6 bg-gray-900/30 border border-gray-700/50 rounded-xl hover:border-pink-400/50 hover:bg-pink-900/20 transition-all duration-300 opacity-0"
                        >
                            <div className="w-12 h-12 mb-3 flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all">
                                <svg className="w-6 h-6 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-pink-400 group-hover:text-pink-300">Main Instagram</span>
                        </a>

                        {/* Instagram Photo */}
                        <a 
                            href="https://instagram.com/cyhpics"
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="contact-button group flex flex-col items-center p-6 bg-gray-900/30 border border-gray-700/50 rounded-xl hover:border-amber-400/50 hover:bg-amber-900/20 transition-all duration-300 opacity-0"
                        >
                            <div className="w-12 h-12 mb-3 flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all">
                                <svg className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-amber-400 group-hover:text-pink-300">Photo Instagram</span>
                        </a>

                        {/* Email */}
                        <button
                            onClick={handleCopyEmail}
                            className="contact-button group flex flex-col items-center p-6 bg-gray-900/30 border border-gray-700/50 rounded-xl hover:border-cyan-400/50 hover:bg-cyan-900/20 transition-all duration-300 opacity-0 relative"
                        >
                            <div className="w-12 h-12 mb-3 flex items-center justify-center bg-cyan-600/20 rounded-lg group-hover:bg-cyan-500/30 transition-colors">
                                {emailCopied ? (
                                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                    </svg>
                                )}
                            </div>
                            <span className="text-sm font-medium text-cyan-400 group-hover:text-cyan-300">
                                {emailCopied ? 'Copied!' : 'Copy Email'}
                            </span>

                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-cyan-300/0 group-hover:text-cyan-300/100 transition-all duration-200 whitespace-nowrap">
                                calebhan@unc.edu
                            </span>
                        </button>
                    </div>
                </div>
                </div>
            </section>
        </>
    );
}