import React, {useState} from "react";
import Masonry from "react-masonry-css";
import { useLanguage } from "./LanguageContext";

const CameraBody = ({ viewfinderText, onHover, onLeave, onClick, currentView, content }) => {
    const [hoveredProject, setHoveredProject] = useState(null);
    const [hoveredPhoto, setHoveredPhoto] = useState(null);
    const { language, toggleLanguage } = useLanguage();

    const bodyX = 20, bodyY = 20, bodyWidth = 360, bodyHeight = 200;
    const screenX = 50, screenY = 60, screenWidth = 210, screenHeight = 150;
    const circleX = 320, circleY = 175, circleRadius = 25;
    const crossLineX1 = circleX + 18, crossLineY1 = circleY + 18, crossLineX2 = circleX - 18, crossLineY2 = circleY - 18;

    const masonryBreakpoints = {
        default: 3,
        1024: 2,
        768: 1
    };

    const labels = {
        home: language === "en" ? "home" : "홈",
        code: language === "en" ? "code" : "코딩",
        about: language === "en" ? "about me" : "내 소개",
        photos: language === "en" ? "photos" : "사진"
    };

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

            {currentView === "coding" && content && (
                <foreignObject x={screenX + 5} y={screenY + 5} width={screenWidth - 10} height={screenHeight - 10}>
                    <div style={{ height: '100%', overflowY: 'auto' }}>
                        <div className="grid grid-cols-3 gap-2">
                            {content.map((project, index) => (
                                <div key={index}
                                     className="relative bg-gray-800 rounded-md shadow-md cursor-pointer hover:bg-gray-700"
                                     onClick={() => window.open(project.link, "_blank")}
                                     onMouseEnter={() => setHoveredProject(project)}
                                     onMouseLeave={() => setHoveredProject(null)}
                                >
                                    <img src={project.thumbnail} alt={project.name} className="w-full h-24 object-cover rounded-t-md"
                                         style={{ maxWidth: '100%', maxHeight: '100%', display: 'block', cursor: 'pointer' }}/>
                                </div>
                            ))}
                        </div>
                    </div>
                </foreignObject>
            )}

            {currentView === "coding" && hoveredProject && (
                <foreignObject x={screenX + 220} y={screenY} width={100} height={screenHeight - 10}>
                    <div className="p-2 text-light bg-dark bg-opacity-75 rounded transition-all">
                        <div style={{ fontSize: "4px" }}>{hoveredProject.name}</div>
                        <div style={{ fontSize: "3px" }}>{hoveredProject.description}</div>
                    </div>
                </foreignObject>
            )}

            {currentView === "about" && (
                <foreignObject x={screenX + 5} y={screenY + 5} width={screenWidth - 10} height={screenHeight - 10}>
                    <div style={{
                        height: '100%',
                        overflowY: 'auto',
                        padding: '10px',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        lineHeight: '1.5',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        borderRadius: '8px'
                    }}>
                        <h2 style={{ fontSize: '8px', marginBottom: '8px' }}>
                            {language === "en"
                                ? "👋 About Me"
                                : "👋 자기소개"}
                        </h2>
                        <p style={{ fontSize: '5px' }}>
                            {language === "en"
                                ? "Hey! I'm Caleb, a student at University of North Carolina at Chapel Hill (class of 2028) intending to study Computer Science with minors in Physics and Neuroscience. I am passionate about photography and coding. I enjoy capturing landscapes and portraits with my Canon EOS R50 and drones (DJI Mini 4 Pro and DJI Avata 2)."
                                : "안녕하세요! 저는 미국에 있는 UNC 채플힐 대학교 (2028년 졸업 예정) 에서 컴퓨터 과학을 전공하고 물리학과 신경과학을 부전공할 예정인 한윤호 입니다. 저는 사진과 코딩에 열정을 가지고 있습니다. Canon EOS R50과 드론 (DJI Mini 4 Pro 및 DJI Avata 2) 을 사용하여 풍경 및 인물 사진을 촬영하는 것을 좋아합니다."}
                        </p>
                        <h3 style={{ fontSize: '6px', marginTop: '12px' }}>
                            {language === "en"
                                ? "✉️ Contact Me"
                                : "✉️ 연락처"}
                            </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                            <a href="https://www.instagram.com/calebyhan" target="_blank" rel="noopener noreferrer"
                               style={{ textDecoration: 'none', color: '#FFFFFF', fontSize: '5px', display: 'flex', alignItems: 'center' }}>
                                <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
                                     alt="Instagram"
                                     style={{ width: '8px', height: '8px', marginRight: '4px' }} />
                                Instagram
                            </a>

                            <a href="https://www.linkedin.com/in/calebyhan/" target="_blank" rel="noopener noreferrer"
                               style={{ textDecoration: 'none', color: '#FFFFFF', fontSize: '5px', display: 'flex', alignItems: 'center' }}>
                                <img src="https://upload.wikimedia.org/wikipedia/commons/8/81/LinkedIn_icon.svg"
                                     alt="LinkedIn"
                                     style={{ width: '8px', height: '8px', marginRight: '4px' }} />
                                LinkedIn
                            </a>

                            <a href="https://github.com/calebyhan" target="_blank" rel="noopener noreferrer"
                               style={{ textDecoration: 'none', color: '#FFFFFF', fontSize: '5px', display: 'flex', alignItems: 'center' }}>
                                <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg"
                                     alt="GitHub"
                                     style={{ width: '8px', height: '8px', marginRight: '4px' }} />
                                GitHub
                            </a>

                            <div style={{ textDecoration: 'none', color: '#FFFFFF', fontSize: '5px', display: 'flex', alignItems: 'center' }}>
                                <img src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Gmail_Icon.png"
                                     alt="Email"
                                     style={{ width: '8px', height: '8px', marginRight: '4px' }} />
                                calebhan (at) unc.edu
                            </div>
                        </div>
                    </div>
                </foreignObject>
            )}

            {currentView === "about" && (
                <foreignObject x={screenX + 220} y={screenY} width={100} height={screenHeight - 10}>
                    <img src={ "/assets/headshot.JPG" } alt="Headshot" style={{ width: '100%', height: '55%', borderRadius: '8px' }} />
                </foreignObject>
            )}

            {currentView === "photo" && content && (
                <foreignObject x={55} y={65} width={200} height={140}>
                    <div style={{ height: '100%', overflowY: 'auto' }}>
                        <Masonry
                            breakpointCols={masonryBreakpoints}
                            className="masonry-grid"
                            columnClassName="masonry-column"
                        >
                            {content.map((photo, index) => (
                                <div key={index} className="relative cursor-pointer"
                                     onClick={() => window.open(photo.url, "_blank")}
                                     onMouseEnter={() => setHoveredPhoto(photo)}
                                     onMouseLeave={() => setHoveredPhoto(null)} >
                                    <img src={photo.url} alt={photo.file_name} loading="lazy" />
                                </div>
                            ))}
                        </Masonry>
                    </div>
                </foreignObject>
            )}

            {currentView === "photo" && hoveredPhoto && (
                <foreignObject x={270} y={60} width={100} height={140}>
                    <div className="p-2 text-light bg-dark bg-opacity-75 rounded">
                        <div style={{ fontSize: "3px" }}>📷 {hoveredPhoto.camera} | {hoveredPhoto.lens}</div>
                        <div style={{ fontSize: "3px" }}>🎛️ {hoveredPhoto.focal_length} | {hoveredPhoto.aperture} | {hoveredPhoto.exposure} | ISO {hoveredPhoto.ISO}</div>
                        <div style={{ fontSize: "3px" }}>📍 {hoveredPhoto.location} | {hoveredPhoto.created}</div>
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
                  onMouseEnter={() => onHover(labels.home)} onMouseLeave={onLeave}
                  onClick={() => onClick("")}
            >𖠿</text>

            <text x={circleX} y={circleY + 17} fontSize="4" fill="#FFFFFF" textAnchor="middle" cursor="pointer"
                  onMouseEnter={() => onHover(labels.code)} onMouseLeave={onLeave}
                  onClick={() => onClick("coding")}
            >{"</>"}</text>

            <text x={circleX - 15} y={circleY + 1} fontSize="4" fill="#FFFFFF" textAnchor="middle" cursor="pointer"
                  onMouseEnter={() => onHover(labels.about)} onMouseLeave={onLeave}
                  onClick={() => onClick("about")}
            >👋</text>

            <text x={circleX + 15} y={circleY + 1} fontSize="4" fill="#FFFFFF" textAnchor="middle" cursor="pointer"
                  onMouseEnter={() => onHover(labels.photos)} onMouseLeave={onLeave}
                  onClick={() => onClick("photography")}
            >📷</text>

            {/* Cross Lines */}
            <line x1={crossLineX1} y1={crossLineY1} x2={crossLineX2} y2={crossLineY2} stroke="#5A5A5A" strokeWidth="1" />
            <line x1={crossLineX1} y1={crossLineY2} x2={crossLineX2} y2={crossLineY1} stroke="#5A5A5A" strokeWidth="1" />

            {/* Language Toggle */}
            <circle cx={circleX + 40} cy={circleY + 19} r={7} fill="#2D2D2D" stroke="#505050" strokeWidth="2" />
            <text x={circleX + 40} y={circleY + 20} fontSize="4" fill="#FFFFFF" textAnchor="middle" cursor="pointer"
                  onClick={toggleLanguage}
            >{language === "en" ? "EN" : "KO"}</text>
        </svg>
    );
};

export default CameraBody;
