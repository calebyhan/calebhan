"use client";

import { useEffect, useRef, useState } from "react";
import { animate, createTimeline, utils, stagger } from "animejs";

export default function NextSection() {
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

    useEffect(() => {
        // Intersection Observer for triggering animations
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

        // Observe all sections
        [aboutRef, skillsRef, projectsRef, contactRef].forEach(ref => {
            if (ref.current) observer.observe(ref.current);
        });

        return () => observer.disconnect();
    }, [hasAnimated]);

    // About section animation
    const animateAboutSection = () => {
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
        }, 400);
    };

    // Skills section animation with staggering
    const animateSkillsSection = () => {
        const skillCards = skillsRef.current.querySelectorAll('.skill-card');
        
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

        // Animate skill tags with wave effect
        setTimeout(() => {
            const tags = skillsRef.current.querySelectorAll('.skill-tag');
            animate(tags, {
                scale: [0, 1],
                opacity: [0, 1],
                rotateZ: [180, 0],
                duration: 600,
                delay: stagger(50, {start: 300}),
                easing: 'easeOutBack(1.7)'
            });
        }, 400);
    };

    // Projects section with morphing animation
    const animateProjectsSection = () => {
        const projectTitle = projectsRef.current.querySelector('h2');
        const projectCards = projectsRef.current.querySelectorAll('.project-card');

        // Title animation with letter staggering
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

        // Project cards with morphing effect
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
    };

    // Contact section with floating elements
    const animateContactSection = () => {
        const contactTitle = contactRef.current.querySelector('h2');
        const contactText = contactRef.current.querySelector('p');
        const contactButtons = contactRef.current.querySelectorAll('.contact-button');

        const tl = createTimeline();

        tl.add(contactTitle, {
            opacity: [0, 1],
            translateY: [40, 0],
            scale: [0.9, 1],
            duration: 800
        })
        .add(contactText, {
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 600
        }, '-=400')
        .add(contactButtons, {
            opacity: [0, 1],
            translateY: [30, 0],
            scale: [0.8, 1],
            rotateZ: [10, 0],
            duration: 700,
            delay: stagger(150)
        }, '-=300');

        // Floating animation for buttons
        animate(contactButtons, {
            translateY: [-5, 5],
            duration: 2000,
            loop: true,
            direction: 'alternate',
            easing: 'easeInOutSine',
            delay: stagger(200, {start: 1000})
        });
    };

    // Interactive hover effects
    const handleSkillCardHover = (e) => {
        animate(e.currentTarget, {
            scale: 1.05,
            rotateY: 5,
            duration: 300,
            easing: 'easeOutQuart'
        });

        // Animate skill tags inside
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

    return (
        <section 
            ref={sectionRef}
            className="min-h-screen bg-black text-white py-24 relative overflow-hidden"
        >
            {/* Animated background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-10 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse" />
                <div className="absolute top-1/3 right-20 w-1 h-1 bg-cyan-400/40 rounded-full animate-bounce" />
                <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-purple-400/20 rounded-full animate-ping" />
            </div>

            {/* Content container */}
            <div className="mx-auto max-w-4xl px-6 space-y-24">
                {/* About section */}
                <div ref={aboutRef} className="text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 antialiased opacity-0">
                        About Me
                    </h2>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto antialiased leading-relaxed opacity-0">
                        Passionate about creating beautiful digital experiences through code and lens
                    </p>
                </div>

                {/* Skills grid */}
                <div ref={skillsRef} className="grid md:grid-cols-2 gap-12">
                    <div 
                        className="skill-card space-y-6 p-6 rounded-lg bg-gray-900/20 backdrop-blur-sm border border-gray-800/50"
                        onMouseEnter={handleSkillCardHover}
                        onMouseLeave={handleSkillCardLeave}
                    >
                        <h3 className="text-2xl md:text-3xl font-semibold text-blue-400 antialiased">
                            Development
                        </h3>
                        <p className="text-gray-300 text-lg leading-relaxed antialiased">
                            I build modern web applications using cutting-edge technologies. 
                            From React and Next.js to full-stack solutions, I create digital 
                            experiences that are both functional and beautiful.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <span className="skill-tag px-4 py-2 bg-blue-600/20 border border-blue-400/30 text-blue-300 text-sm rounded-full">React</span>
                            <span className="skill-tag px-4 py-2 bg-green-600/20 border border-green-400/30 text-green-300 text-sm rounded-full">Next.js</span>
                            <span className="skill-tag px-4 py-2 bg-purple-600/20 border border-purple-400/30 text-purple-300 text-sm rounded-full">Tailwind</span>
                        </div>
                    </div>

                    <div 
                        className="skill-card space-y-6 p-6 rounded-lg bg-gray-900/20 backdrop-blur-sm border border-gray-800/50"
                        onMouseEnter={handleSkillCardHover}
                        onMouseLeave={handleSkillCardLeave}
                    >
                        <h3 className="text-2xl md:text-3xl font-semibold text-cyan-400 antialiased">
                            Photography
                        </h3>
                        <p className="text-gray-300 text-lg leading-relaxed antialiased">
                            Through my lens, I capture moments and stories. My photography 
                            explores the intersection of light, emotion, and narrative, 
                            creating visual stories that resonate.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <span className="skill-tag px-4 py-2 bg-amber-600/20 border border-amber-400/30 text-amber-300 text-sm rounded-full">Urban</span>
                            <span className="skill-tag px-4 py-2 bg-teal-600/20 border border-teal-400/30 text-teal-300 text-sm rounded-full">Landscape</span>
                            <span className="skill-tag px-4 py-2 bg-red-600/20 border border-red-400/30 text-red-300 text-sm rounded-full">Street</span>
                        </div>
                    </div>
                </div>

                {/* Projects section */}
                <div ref={projectsRef}>
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 antialiased">
                        Recent Projects
                    </h2>

                    <div className="grid gap-8">
                        <div 
                            className="project-card bg-gray-900/50 border border-gray-800 backdrop-blur-sm p-8 rounded-xl transition-colors cursor-pointer"
                            onMouseEnter={handleProjectCardHover}
                            onMouseLeave={handleProjectCardLeave}
                        >
                            <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-blue-400 antialiased">
                                Web Application
                            </h3>
                            <p className="text-gray-300 mb-6 text-lg leading-relaxed antialiased">
                                A full-stack application built with Next.js and modern web technologies. 
                                Features include user authentication, real-time updates, and responsive design.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <span className="px-4 py-2 bg-blue-600/20 border border-blue-400/30 text-blue-300 text-sm rounded-full">React</span>
                                <span className="px-4 py-2 bg-green-600/20 border border-green-400/30 text-green-300 text-sm rounded-full">Next.js</span>
                                <span className="px-4 py-2 bg-purple-600/20 border border-purple-400/30 text-purple-300 text-sm rounded-full">Tailwind</span>
                            </div>
                        </div>

                        <div 
                            className="project-card bg-gray-900/50 border border-gray-800 backdrop-blur-sm p-8 rounded-xl transition-colors cursor-pointer"
                            onMouseEnter={handleProjectCardHover}
                            onMouseLeave={handleProjectCardLeave}
                        >
                            <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-cyan-400 antialiased">
                                Photography Series
                            </h3>
                            <p className="text-gray-300 mb-6 text-lg leading-relaxed antialiased">
                                A collection of urban landscape photography capturing the essence of city life. 
                                Shot across multiple locations with focus on light and shadow interplay.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <span className="px-4 py-2 bg-amber-600/20 border border-amber-400/30 text-amber-300 text-sm rounded-full">Urban</span>
                                <span className="px-4 py-2 bg-teal-600/20 border border-teal-400/30 text-teal-300 text-sm rounded-full">Landscape</span>
                                <span className="px-4 py-2 bg-red-600/20 border border-red-400/30 text-red-300 text-sm rounded-full">Street</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact section */}
                <div ref={contactRef} className="text-center pt-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8 antialiased opacity-0">
                        Get In Touch
                    </h2>
                    <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto antialiased opacity-0">
                        Interested in working together? Let&apos;s create something amazing.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <button className="contact-button px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors antialiased opacity-0">
                            Contact Me
                        </button>
                        <button className="contact-button px-8 py-4 border border-white text-white font-semibold rounded-lg hover:bg-white hover:text-black transition-colors antialiased opacity-0">
                            View Portfolio
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}