import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CameraBody from "../components/CameraBody";
import { useLanguage } from "../components/LanguageContext";

const HomeContent = () => {
    const { language } = useLanguage();
    const [viewfinderText, setViewfinderText] = useState(language === "en" ? "caleb han" : "한윤호");
    const [photos, setPhotos] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const res = await fetch('/metadata.json');
                const data = await res.json();
                const featuredPhotos = data.metadata
                    .filter(item => item.feature)
                    .map(item => ({ ...item, url: `/photos/${item.file_name}` }));
                setPhotos(featuredPhotos);
            } catch (error) {
                console.error("Failed to load photos:", error);
            }
        };

        fetchPhotos();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % photos.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [photos]);

    useEffect(() => {
        setViewfinderText(language === "en" ? "caleb han" : "한윤호");
    }, [language]);

    const handleHover = (text) => setViewfinderText(text);
    const handleLeave = () => setViewfinderText(language === "en" ? "caleb han" : "한윤호");
    const handleNavigation = (view) => navigate(`/${view}`);

    return (
        <CameraBody
            viewfinderText={viewfinderText}
            onHover={handleHover}
            onLeave={handleLeave}
            onClick={handleNavigation}
            currentView="home"
            content={photos[currentIndex]}
        />
    );
};

const Home = () => {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-900">
            <HomeContent />
        </div>
    );
};

export default Home;
