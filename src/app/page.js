"use client";
import Navbar from "@/components/Navbar";
import HeroScroll from "@/components/HeroScroll";
import NextSection from "@/components/NextSection";

export default function Home() {
    return (
        <div className="w-full min-h-screen bg-black text-white">
            {/* Fixed navbar */}
            <Navbar />
            
            {/* Hero scroll section with camera push-in effect */}
            <HeroScroll />
            
            {/* Content section that fades in after the camera effect */}
            <NextSection />
        </div>
    );
}