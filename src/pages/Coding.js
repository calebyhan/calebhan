import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CameraBody from "../components/CameraBody";
import { useLanguage } from "../components/LanguageContext";

const Coding = () => {
    const { language } = useLanguage();
    const [viewfinderText, setViewfinderText] = useState(language === "en" ? "my code" : "내 코드");
    const [projects, setProjects] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/coding.json')
            .then(res => res.json())
            .then(data => setProjects(data.projects))
            .catch(err => console.error("Failed to load projects:", err));
    }, []);

    useEffect(() => {
        setViewfinderText(language === "en" ? "my code" : "내 코드");
    }, [language]);

    const handleHover = (text) => setViewfinderText(text);
    const handleLeave = () => setViewfinderText(language === "en" ? "my code" : "내 코드");
    const handleNavigation = (view) => navigate(`/${view}`);

    return (
        <div className="flex justify-center items-center h-screen bg-gray-900">
            <CameraBody
                viewfinderText={viewfinderText}
                onHover={handleHover}
                onLeave={handleLeave}
                onClick={handleNavigation}
                currentView="coding"
                content={projects} />
        </div>
    );
};

export default Coding;
