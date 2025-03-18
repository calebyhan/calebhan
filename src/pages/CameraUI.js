import React from "react";
import { useNavigate } from "react-router-dom";

const CameraUI = () => {
    const navigate = useNavigate();

    // Define base coordinates and dimensions as variables
    const bodyX = 20, bodyY = 20, bodyWidth = 360, bodyHeight = 200;
    const screenX = 50, screenY = 60, screenWidth = 210, screenHeight = 130;
    const circleX = 300, circleY = 160, circleRadius = 25;

    const crossLineX1 = circleX + 18, crossLineY1 = circleY + 18, crossLineX2 = circleX - 18, crossLineY2 = circleY - 18;

    React.useEffect(() => {
        // Lock scroll when Camera UI is up
        document.body.style.overflow = "hidden";

        // Clean up to reset overflow property when component unmounts
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    return (
        <div className="relative flex justify-center items-center h-screen bg-gray-900">
            <svg viewBox="0 0 400 300" className="w-[400px] h-[300px]" xmlns="http://www.w3.org/2000/svg">
                {/* Camera Body */}
                <rect x={bodyX} y={bodyY} width={bodyWidth} height={bodyHeight} rx="20" fill="#1E1E1E" stroke="#3A3A3A" strokeWidth="2" />

                {/* Screen */}
                <rect x={screenX} y={screenY} width={screenWidth} height={screenHeight} fill="#000000" stroke="#5A5A5A" strokeWidth="2" />

                {/* Circular Navigation Button with Emojis */}
                <circle cx={circleX} cy={circleY} r={circleRadius} fill="#2D2D2D" stroke="#505050" strokeWidth="2" />

                <text x={circleX} y={circleY - 12} fontSize="16" fill="#FFFFFF" textAnchor="middle" cursor="pointer" onClick={() => navigate("/coding")}>
                    💻
                </text>
                <text x={circleX} y={circleY + 19} fontSize="16" fill="#FFFFFF" textAnchor="middle" cursor="pointer" onClick={() => navigate("/photography")}>
                    📸
                </text>
                <text x={circleX - 16} y={circleY + 4} fontSize="16" fill="#FFFFFF" textAnchor="middle" cursor="pointer" onClick={() => navigate("/about")}>
                    🧑‍💻
                </text>

                {/* Cross pattern for dividing the circle */}
                <line x1={crossLineX1} y1={crossLineY1} x2={crossLineX2} y2={crossLineY2} stroke="#5A5A5A" strokeWidth="1" />
                <line x1={crossLineX1} y1={crossLineY2} x2={crossLineX2} y2={crossLineY1} stroke="#5A5A5A" strokeWidth="1" />

                {/* Additional Buttons */}
                <circle cx="350" cy="60" r="8" fill="#6B7280" className="cursor-pointer" />
                <circle cx="350" cy="90" r="8" fill="#6B7280" className="cursor-pointer" />
                <circle cx="350" cy="120" r="8" fill="#6B7280" className="cursor-pointer" />
                <circle cx="350" cy="150" r="8" fill="#6B7280" className="cursor-pointer" />
                <circle cx="350" cy="180" r="8" fill="#6B7280" className="cursor-pointer" />

                {/* Top Panel and Viewfinder */}
                <rect x={screenX} y={bodyY - 15} width="100" height="30" rx="5" fill="#3A3A3A" />
                <circle cx={screenX + 20} cy={bodyY} r="10" fill="#6B7280" />
            </svg>
        </div>
    );
};

export default CameraUI;
