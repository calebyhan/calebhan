import React, { useState, useEffect } from "react";
import CameraBody from "../components/CameraBody";
import { useNavigate } from "react-router-dom";

const Photography = () => {
    const [viewfinderText, setViewfinderText] = useState("photos");
    const [photos, setPhotos] = useState([]);
    const navigate = useNavigate();

    const handleHover = (text) => setViewfinderText(text);
    const handleLeave = () => setViewfinderText("photos");
    const handleNavigation = (view) => navigate(`/${view}`);

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