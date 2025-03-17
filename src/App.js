import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import "./App.css";
import CameraUI from "./CameraUI";
import Coding from "./Coding";
import Photography from "./Photography";
import About from "./About";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

function App() {
    return (
        <Router>
            <div className="bg-gray-900 min-h-screen flex justify-center items-center">
                <Routes>
                    <Route path="/" element={<CameraUI />} />
                    <Route path="/coding" element={<Coding />} />
                    <Route path="/photography" element={<Photography />} />
                    <Route path="/about" element={<About />} />
                </Routes>
            </div>
            <Analytics />
            <SpeedInsights />
        </Router>
    );
}

export default App;
