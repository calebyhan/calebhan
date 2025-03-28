import React from "react";

const CameraBody = ({ viewfinderText, onHover, onLeave, onClick, currentView, content }) => {
    const bodyX = 20, bodyY = 20, bodyWidth = 360, bodyHeight = 200;
    const screenX = 50, screenY = 60, screenWidth = 210, screenHeight = 150;
    const circleX = 300, circleY = 160, circleRadius = 25;
    const crossLineX1 = circleX + 18, crossLineY1 = circleY + 18, crossLineX2 = circleX - 18, crossLineY2 = circleY - 18;

    return (
        <svg viewBox="0 0 400 300" className="w-[400px] h-[300px]" xmlns="http://www.w3.org/2000/svg">
            {/* Camera Body */}
            <rect x={bodyX} y={bodyY} width={bodyWidth} height={bodyHeight} rx="20" fill="#1E1E1E" stroke="#3A3A3A" strokeWidth="2" />

            {/* Screen */}
            <rect x={screenX} y={screenY} width={screenWidth} height={screenHeight} fill="#000000" stroke="#5A5A5A" strokeWidth="2" />

            {/* Dynamic Content */}
            {currentView === "home" && content && (
                <foreignObject x={screenX + 5} y={screenY + 5} width={screenWidth - 10} height={screenHeight - 10}>
                    <div className="p-2 text-light bg-dark bg-opacity-75 rounded-md" style={{ fontSize: '12px' }}>
                        <img src={content.url} alt="slideshow"
                             style={{ maxWidth: '100%', maxHeight: '100%', display: 'block' }} />
                    </div>
                </foreignObject>
            )}

            {currentView === "home" && content && (
                <foreignObject x={screenX + 220} y={screenY} width={100} height={screenHeight - 10}>
                    <div className="p-2 text-light bg-dark bg-opacity-75 rounded">
                        <div style={{ fontSize: "3px" }}>📷 {content.camera} | {content.lens}</div>
                        <div style={{ fontSize: "3px" }}>🎛️ {content.focal_length} | {content.aperture} | {content.exposure} | ISO {content.ISO}</div>
                        <div style={{ fontSize: "3px" }}>📍 {content.location} | {content.created}</div>
                    </div>
                </foreignObject>
            )}


            {currentView === "coding" && (
                <foreignObject x={screenX + 5} y={screenY + 5} width={screenWidth - 10} height={screenHeight - 10}>
                    <div className="grid grid-cols-3 gap-2 overflow-y-scroll h-full">
                        {content.map((project, index) => (
                            <div key={index}
                                 className="relative bg-gray-800 rounded-md shadow-md cursor-pointer hover:bg-gray-700"
                                 onMouseEnter={() => onHover(project.name)}
                                 onMouseLeave={onLeave}
                                 onClick={() => window.open(project.link, "_blank")}
                            >
                                <img src={project.thumbnail} alt={project.name} className="w-full h-24 object-cover rounded-t-md" />
                                <div className="absolute inset-0 opacity-0 hover:opacity-100 bg-black bg-opacity-70 flex flex-col justify-center items-center text-white p-2">
                                    <div className="text-sm">{project.name}</div>
                                    <div className="text-xs">{project.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </foreignObject>
            )}

            {/* Top Display */}
            <rect x={screenX} y={bodyY - 15} width="100" height="30" rx="5" fill="#3A3A3A" />
            <circle cx={screenX + 20} cy={bodyY} r="10" fill="#6B7280" />
            <rect x={screenX + 35} y={bodyY - 10} width="60" height="20" rx="5" fill="#1E1E1E" />
            <text x={bodyX + 80} y={bodyY + 2} fontSize="5" fill="#FFFFFF">{viewfinderText}</text>

            {/* Circle Selector */}
            <circle cx={circleX} cy={circleY} r={circleRadius} fill="#2D2D2D" stroke="#505050" strokeWidth="2" />

            <text x={circleX} y={circleY - 12} fontSize="4" fill="#FFFFFF" textAnchor="middle" cursor="pointer"
                  onMouseEnter={() => onHover("home")} onMouseLeave={onLeave}
                  onClick={() => onClick("")}
            >𖠿</text>

            <text x={circleX} y={circleY + 17} fontSize="4" fill="#FFFFFF" textAnchor="middle" cursor="pointer"
                  onMouseEnter={() => onHover("code")} onMouseLeave={onLeave}
                  onClick={() => onClick("coding")}
            >{"</>"}</text>

            <text x={circleX - 15} y={circleY + 1} fontSize="4" fill="#FFFFFF" textAnchor="middle" cursor="pointer"
                  onMouseEnter={() => onHover("about me")} onMouseLeave={onLeave}
                  onClick={() => onClick("about")}
            >👋</text>

            <text x={circleX + 15} y={circleY + 1} fontSize="4" fill="#FFFFFF" textAnchor="middle" cursor="pointer"
                  onMouseEnter={() => onHover("photos")} onMouseLeave={onLeave}
                  onClick={() => onClick("photography")}
            >📷</text>

            {/* Cross Lines */}
            <line x1={crossLineX1} y1={crossLineY1} x2={crossLineX2} y2={crossLineY2} stroke="#5A5A5A" strokeWidth="1" />
            <line x1={crossLineX1} y1={crossLineY2} x2={crossLineX2} y2={crossLineY1} stroke="#5A5A5A" strokeWidth="1" />
        </svg>
    );
};

export default CameraBody;
