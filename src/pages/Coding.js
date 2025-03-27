import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CameraBody from "../components/CameraBody";

const Coding = () => {
    const [viewfinderText, setViewfinderText] = useState("my code");
    const [projects, setProjects] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/coding.json')
            .then(res => res.json())
            .then(data => setProjects(data.projects))
            .catch(err => console.error("Failed to load projects:", err));
    }, []);

    const handleHover = (text) => setViewfinderText(text);
    const handleLeave = () => setViewfinderText("my code");
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
