import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CameraBody from "../components/CameraBody";

const Home = () => {
    const [viewfinderText, setViewfinderText] = useState("caleb han");
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
                    .map(item => ({ ...item, url: `${process.env.PUBLIC_URL}/photos/${item.file_name}` }));
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

    const handleHover = (text) => setViewfinderText(text);
    const handleLeave = () => setViewfinderText("caleb han");
    const handleNavigation = (view) => navigate(`/${view}`);

    return (
        <div className="flex justify-center items-center h-screen bg-gray-900">
            <CameraBody
                viewfinderText={viewfinderText}
                onHover={handleHover}
                onLeave={handleLeave}
                onClick={handleNavigation}
                currentView="home"
                content={photos[currentIndex]}
            />
        </div>
    );
};

export default Home;
