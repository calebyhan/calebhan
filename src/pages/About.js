import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CameraBody from "../components/CameraBody";

const About = () => {
    const [viewfinderText, setViewfinderText] = useState("about me");
    const navigate = useNavigate();

    const handleHover = (text) => setViewfinderText(text);
    const handleLeave = () => setViewfinderText("about me");
    const handleNavigation = (view) => navigate(`/${view}`);

    return (
        <div className="flex justify-center items-center h-screen bg-gray-900">
            <CameraBody
                viewfinderText={viewfinderText}
                onHover={handleHover}
                onLeave={handleLeave}
                onClick={handleNavigation}
                currentView="about"/>
        </div>
    );
};

export default About;
