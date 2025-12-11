"use client";

import { useEffect, useRef, useState } from "react";
import { animate, createTimeline, stagger, utils } from "animejs";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export default function HomeScroll() {
    const containerRef = useRef(null);
    const heroRef = useRef(null);
    const textRef = useRef(null);
    const subtitleRef = useRef(null);
    const particlesRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [scrollIndicatorOpacity, setScrollIndicatorOpacity] = useState(1);
    const prefersReducedMotion = usePrefersReducedMotion();

    useEffect(() => {
        if (!containerRef.current || !textRef.current || !subtitleRef.current) return;

        if (prefersReducedMotion) {
            // Show content immediately without animations
            utils.set(heroRef.current, { opacity: 1 });
            utils.set(subtitleRef.current, { opacity: 1, translateY: 0 });
            setIsLoaded(true);
            return;
        }

        utils.set(subtitleRef.current, { opacity: 0, translateY: 30 });
        utils.set(heroRef.current, { opacity: 0 });

        const particles = [];
        for (let i = 0; i < 20; i++) {
            const p = document.createElement("div");
            p.className = "absolute w-1 h-1 bg-white/20 rounded-full";
            p.style.left = Math.random() * 100 + "%";
            p.style.top = Math.random() * 100 + "%";
            particlesRef.current?.appendChild(p);
            particles.push(p);
        }

        const particlesAnim = animate(particles, {
            translateX: () => utils.random(-100, 100),
            translateY: () => utils.random(-100, 100),
            scale: () => utils.random(0.5, 1.5),
            opacity: () => utils.random(0.1, 0.8),
            duration: () => utils.random(3000, 6000),
            easing: "easeInOutSine",
            loop: true,
            direction: "alternate",
            delay: stagger(100),
        });

        const tl = createTimeline();

        tl.add(heroRef.current, {
            opacity: [0, 1],
            scale: [1.1, 1],
            duration: 1500,
        })
        .add(
            subtitleRef.current,
            {
                opacity: [0, 1],
                translateY: [30, 0],
                duration: 800,
            },
            900
        );

        const handleScroll = () => {
            const denom = document.documentElement.scrollHeight - window.innerHeight || 1;
            const scrollPercent = window.scrollY / denom;
            const heroProgress = Math.min(scrollPercent * 2.5, 1);

            const scrollIndicatorFade = Math.max(0, 1 - (window.scrollY / 100));
            setScrollIndicatorOpacity(scrollIndicatorFade);

            utils.set(heroRef.current, {
                scale: 1 + heroProgress * 0.6,
                opacity: 1 - heroProgress * 0.8,
            });

            utils.set(subtitleRef.current, {
                translateY: heroProgress * -50,
                opacity: 1 - heroProgress * 1.2,
            });
        };

        window.addEventListener("scroll", handleScroll);
        setIsLoaded(true);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            particlesAnim.pause?.();
            particles.forEach((p) => p.remove());
        };
    }, [prefersReducedMotion]);

    return (
        <section ref={containerRef} className="relative h-[150vh] overflow-hidden">
            <div className="sticky top-0 h-screen w-full">
                <div ref={particlesRef} className="absolute inset-0 pointer-events-none" />

                <div
                    ref={heroRef}
                    className="absolute inset-0 opacity-0"
                    style={{
                        backgroundImage: "url(/img/home.jpg)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/60" />
                    <div className="absolute top-20 right-20 w-32 h-32 border border-white/20 rotate-45 animate-pulse" />
                    <div
                        className="absolute bottom-40 left-20 w-20 h-20 bg-blue-500/10 rounded-full animate-bounce"
                        style={{ animationDelay: "1s", animationDuration: "3s" }}
                    />
                </div>

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <h1
                        ref={textRef}
                        className="font-bold tracking-tight select-none antialiased text-white text-[clamp(3rem,30vw,8rem)] leading-none mb-6"
                    >
                        <span className="inline-block drop-shadow-2xl">Caleb Han</span>
                    </h1>

                    <p
                        ref={subtitleRef}
                        className="text-lg md:text-xl text-white/90 drop-shadow-lg antialiased"
                    >
                        Developer & Photographer
                    </p>

                    {isLoaded && (
                        <div 
                            className="absolute -bottom-32 left-1/2 -translate-x-1/2 transition-opacity duration-300"
                            style={{ opacity: scrollIndicatorOpacity }}
                        >
                            <div className="flex flex-col items-center space-y-2">
                                <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center relative">
                                    <div
                                        className="w-1 h-3 bg-white/80 rounded-full mt-2"
                                        style={{ animation: "bounce 2s infinite" }}
                                    />
                                </div>
                                
                                <div className="w-4 h-4 border-r-2 border-b-2 border-white/60 transform rotate-[45deg] animate-pulse" />
                            </div>
                            <p className="text-white/60 text-sm mt-3 text-center">Scroll</p>
                        </div>
                    )}
                </div>

                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <div className="absolute top-8 left-8">
                        <div className="w-12 h-0.5 bg-white/40 mb-2" />
                        <div className="w-0.5 h-12 bg-white/40" />
                    </div>
                    <div className="absolute bottom-8 right-8">
                        <div className="w-12 h-0.5 bg-white/40 mb-2 ml-auto" />
                        <div className="w-0.5 h-12 bg-white/40 ml-auto" />
                    </div>
                </div>
            </div>
        </section>
    );
}