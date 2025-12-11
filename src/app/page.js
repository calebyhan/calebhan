"use client";

import Navbar from "@/components/Navbar";
import HomeScroll from "@/components/HomeScroll";
import About from "@/components/About";

export default function Home() {
    return (
        <div className="w-full min-h-screen bg-black text-white">
            <Navbar />
            
            <HomeScroll />
            
            <About />
        </div>
    );
}