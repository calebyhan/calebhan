import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import 'bootstrap/dist/css/bootstrap.min.css';
import "./styles.css";

import Home from "./pages/Home";
import Coding from "./pages/Coding";
import Photography from "./pages/Photography";
import About from "./pages/About";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/coding" element={<Coding />} />
                <Route path="/photography" element={<Photography />} />
                <Route path="/about" element={<About />} />
            </Routes>
            <Analytics />
            <SpeedInsights />
        </BrowserRouter>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <AppRouter />
    </React.StrictMode>
);
