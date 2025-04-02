import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CameraBody from "../components/CameraBody";
import { useLanguage } from "../components/LanguageContext";

const About = () => {
    const { language } = useLanguage();
    const [viewfinderText, setViewfinderText] = useState(language === "en" ? "about me" : "내 소개");
    const navigate = useNavigate();

    useEffect(() => {
        setViewfinderText(language === "en" ? "about me" : "내 소개");
    }, [language]);

    const handleHover = (text) => setViewfinderText(text);
    const handleLeave = () => setViewfinderText(language === "en" ? "about me" : "내 소개");
    const handleNavigation = (view) => navigate(`/${view}`);

    return (
        <div className="flex justify-center items-center h-screen bg-gray-900">
            <CameraBody
                viewfinderText={viewfinderText}
                onHover={handleHover}
                onLeave={handleLeave}
                onClick={handleNavigation}
                currentView="about"
            />
        </div>
    );
};

export default About;
