import { Routes, Route } from "react-router-dom";
import CameraUI from "./CameraUI";

const Coding = () => <div className="text-white text-center p-10">Coding Portfolio</div>;
const Photography = () => <div className="text-white text-center p-10">Photography Portfolio</div>;
const About = () => <div className="text-white text-center p-10">About Me</div>;

function App() {
    return (
        <div className="bg-gray-900 min-h-screen flex justify-center items-center">
            <Routes>
                <Route path="/" element={<CameraUI />} />
                <Route path="/coding" element={<Coding />} />
                <Route path="/photography" element={<Photography />} />
                <Route path="/about" element={<About />} />
            </Routes>
        </div>
    );
}

export default App;
