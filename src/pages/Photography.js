import React, { useState, useEffect } from "react";
import CameraBody from "../components/CameraBody";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../components/LanguageContext";

const Photography = () => {
    const { language } = useLanguage();
    const [viewfinderText, setViewfinderText] = useState(language === "en"? "photos" : "사진");
    const [photos, setPhotos] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const res = await fetch('/metadata.json');
                const data = await res.json();
                const allPhotos = data.metadata.map(item => ({
                    ...item,
                    url: `/photos/${item.file_name}`
                }));
                setPhotos(allPhotos);
            } catch (error) {
                console.error("Failed to load photos:", error);
            }
        };

        fetchPhotos();
    }, []);

    useEffect(() => {
        setViewfinderText(language === "en" ? "photos" : "사진");
    }, [language]);

    const handleHover = (text) => setViewfinderText(text);
    const handleLeave = () => setViewfinderText(language === "en" ? "photos" : "사진");
    const handleNavigation = (view) => navigate(`/${view}`);

    return (
        <div className="flex justify-center items-center h-screen bg-gray-900">
            <CameraBody
                viewfinderText={viewfinderText}
                onHover={handleHover}
                onLeave={handleLeave}
                onClick={handleNavigation}
                currentView="photo"
                content={photos}
            />

        </div>
    );
};

export default Photography;