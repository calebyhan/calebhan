import { HashRouter as Router, Route, Routes } from "react-router-dom";
import CameraUI from "./CameraUI";
import Coding from "./Coding";
import Photography from "./Photography";
import About from "./About";

function App() {
    return (
        <div className="bg-gray-900 min-h-screen flex justify-center items-center">
            <Router>
                <Routes>
                    <Route path="/" element={<CameraUI />} />
                    <Route path="/coding" element={<Coding />} />
                    <Route path="/photography" element={<Photography />} />
                    <Route path="/about" element={<About />} />
                </Routes>
            </Router>
        </div>
    );
}

export default App;