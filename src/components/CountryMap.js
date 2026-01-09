"use client";

import { useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";

// TopoJSON data URLs
const worldGeoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const usaStatesGeoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// Map between GeoJSON country names and our photo data country names
const COUNTRY_NAME_MAP = {
  "United States of America": "United States",
  // Add more mappings as needed
};

// Convert GeoJSON country name to our photo data country name
function normalizeCountryName(geoName) {
  return COUNTRY_NAME_MAP[geoName] || geoName;
}

export default function CountryMap({ selectedCountry, onSelectCountry, countries, states }) {
  // Check if there are any US photos
  const hasUSPhotos = countries.includes("United States");

  // Default to USA States if US photos exist, otherwise World
  const [mapMode, setMapMode] = useState(hasUSPhotos ? "usa" : "world");

  // Zoom state for world map
  const [worldZoom, setWorldZoom] = useState(1);
  const [worldCenter, setWorldCenter] = useState([0, 20]);

  // Zoom state for USA map (center around the middle of the US)
  const [usaZoom, setUsaZoom] = useState(1);
  const [usaCenter, setUsaCenter] = useState([-96, 38]);

  // Use states array if provided, otherwise empty
  const availableStates = states || [];

  // Reset zoom when switching map modes
  const handleMapModeChange = (mode) => {
    setMapMode(mode);
  };

  // World map zoom handlers
  const handleWorldZoomIn = () => {
    if (worldZoom < 4) setWorldZoom(worldZoom * 1.5);
  };

  const handleWorldZoomOut = () => {
    if (worldZoom > 1) setWorldZoom(worldZoom / 1.5);
  };

  const handleWorldResetZoom = () => {
    setWorldZoom(1);
    setWorldCenter([0, 20]);
  };

  // USA map zoom handlers
  const handleUsaZoomIn = () => {
    if (usaZoom < 4) setUsaZoom(usaZoom * 1.5);
  };

  const handleUsaZoomOut = () => {
    if (usaZoom > 1) setUsaZoom(usaZoom / 1.5);
  };

  const handleUsaResetZoom = () => {
    setUsaZoom(1);
    setUsaCenter([-96, 38]);
  };

  return (
    <div className="bg-black/30 border border-gray-700/50 rounded-lg p-4">
      {/* Map Mode Toggle */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => handleMapModeChange("usa")}
          disabled={!hasUSPhotos}
          className={`flex-1 px-4 py-2.5 md:px-3 md:py-1.5 text-sm md:text-xs rounded transition-colors min-h-[44px] md:min-h-0 ${
            mapMode === "usa"
              ? "bg-cyan-600/30 border border-cyan-400/50 text-cyan-300"
              : hasUSPhotos
                ? "bg-gray-800/30 border border-gray-700/30 text-gray-400 hover:bg-gray-700/30"
                : "bg-gray-800/10 border border-gray-700/20 text-gray-600 cursor-not-allowed"
          }`}
        >
          USA States
        </button>
        <button
          onClick={() => handleMapModeChange("world")}
          className={`flex-1 px-4 py-2.5 md:px-3 md:py-1.5 text-sm md:text-xs rounded transition-colors min-h-[44px] md:min-h-0 ${
            mapMode === "world"
              ? "bg-cyan-600/30 border border-cyan-400/50 text-cyan-300"
              : "bg-gray-800/30 border border-gray-700/30 text-gray-400 hover:bg-gray-700/30"
          }`}
        >
          World
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={mapMode === "world" ? handleWorldZoomIn : handleUsaZoomIn}
          disabled={(mapMode === "world" ? worldZoom : usaZoom) >= 4}
          className="flex-1 px-4 py-2.5 md:px-3 md:py-1.5 text-sm md:text-xs bg-gray-800/30 border border-gray-700/30 text-gray-400 hover:bg-gray-700/30 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] md:min-h-0"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <svg className="w-5 h-5 md:w-3.5 md:h-3.5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          onClick={mapMode === "world" ? handleWorldZoomOut : handleUsaZoomOut}
          disabled={(mapMode === "world" ? worldZoom : usaZoom) <= 1}
          className="flex-1 px-4 py-2.5 md:px-3 md:py-1.5 text-sm md:text-xs bg-gray-800/30 border border-gray-700/30 text-gray-400 hover:bg-gray-700/30 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] md:min-h-0"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <svg className="w-5 h-5 md:w-3.5 md:h-3.5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <button
          onClick={mapMode === "world" ? handleWorldResetZoom : handleUsaResetZoom}
          disabled={(mapMode === "world" ? worldZoom : usaZoom) === 1}
          className="flex-1 px-4 py-2.5 md:px-3 md:py-1.5 text-sm md:text-xs bg-gray-800/30 border border-gray-700/30 text-gray-400 hover:bg-gray-700/30 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] md:min-h-0"
          title="Reset View"
          aria-label="Reset View"
        >
          Reset
        </button>
      </div>

      {mapMode === "world" ? (
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 120,
            center: [0, 20]
          }}
          className="w-full h-auto"
          style={{
            width: "100%",
            height: "auto",
            backgroundColor: "rgba(0, 0, 0, 0.4)"
          }}
        >
          <ZoomableGroup
            zoom={worldZoom}
            center={worldCenter}
            onMoveEnd={({ coordinates, zoom: newZoom }) => {
              setWorldCenter(coordinates);
              setWorldZoom(newZoom);
            }}
            minZoom={1}
            maxZoom={4}
          >
            <Geographies geography={worldGeoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const geoCountryName = geo.properties.name;
                const countryName = normalizeCountryName(geoCountryName);
                const isAvailable = countries.includes(countryName);
                const isSelected = selectedCountry === countryName;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => {
                      if (isAvailable) {
                        onSelectCountry(isSelected ? null : countryName);
                      }
                    }}
                    style={{
                      default: {
                        fill: isSelected
                          ? "rgba(6, 182, 212, 0.7)"
                          : isAvailable
                            ? "rgba(6, 182, 212, 0.4)"
                            : "rgba(100, 116, 139, 0.25)",
                        stroke: isSelected
                          ? "rgba(6, 182, 212, 1)"
                          : isAvailable
                            ? "rgba(6, 182, 212, 0.6)"
                            : "rgba(100, 116, 139, 0.5)",
                        strokeWidth: isSelected ? 1.5 : 0.75,
                        outline: "none",
                      },
                      hover: {
                        fill: isAvailable ? "rgba(6, 182, 212, 0.6)" : "rgba(100, 116, 139, 0.3)",
                        stroke: isAvailable ? "rgba(6, 182, 212, 0.8)" : "rgba(100, 116, 139, 0.5)",
                        strokeWidth: isAvailable ? 1.2 : 0.75,
                        outline: "none",
                        cursor: isAvailable ? "pointer" : "default",
                      },
                      pressed: {
                        fill: "rgba(6, 182, 212, 0.8)",
                        stroke: "rgba(6, 182, 212, 1)",
                        strokeWidth: 2,
                        outline: "none",
                      },
                    }}
                  >
                    <title>
                      {geoCountryName}
                      {isAvailable ? " (click to filter)" : " (no photos)"}
                    </title>
                  </Geography>
                );
              })
            }
          </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      ) : (
        <ComposableMap
          projection="geoAlbersUsa"
          className="w-full h-auto"
          style={{
            width: "100%",
            height: "auto",
            backgroundColor: "rgba(0, 0, 0, 0.4)"
          }}
        >
          <ZoomableGroup
            zoom={usaZoom}
            center={usaCenter}
            onMoveEnd={({ coordinates, zoom: newZoom }) => {
              setUsaCenter(coordinates);
              setUsaZoom(newZoom);
            }}
            minZoom={1}
            maxZoom={4}
          >
          <Geographies geography={usaStatesGeoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const stateName = geo.properties.name;
                const isAvailable = availableStates.includes(stateName);
                const isSelected = selectedCountry === stateName;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => {
                      if (isAvailable) {
                        // Toggle state selection
                        onSelectCountry(isSelected ? null : stateName);
                      }
                    }}
                    style={{
                      default: {
                        fill: isSelected
                          ? "rgba(6, 182, 212, 0.7)"
                          : isAvailable
                            ? "rgba(6, 182, 212, 0.4)"
                            : "rgba(100, 116, 139, 0.25)",
                        stroke: isSelected
                          ? "rgba(6, 182, 212, 1)"
                          : isAvailable
                            ? "rgba(6, 182, 212, 0.6)"
                            : "rgba(100, 116, 139, 0.5)",
                        strokeWidth: isSelected ? 1.5 : 0.75,
                        outline: "none",
                      },
                      hover: {
                        fill: isAvailable ? "rgba(6, 182, 212, 0.6)" : "rgba(100, 116, 139, 0.3)",
                        stroke: isAvailable ? "rgba(6, 182, 212, 1)" : "rgba(100, 116, 139, 0.5)",
                        strokeWidth: isAvailable ? 1.2 : 0.75,
                        outline: "none",
                        cursor: isAvailable ? "pointer" : "default",
                      },
                      pressed: {
                        fill: "rgba(6, 182, 212, 0.8)",
                        stroke: "rgba(6, 182, 212, 1)",
                        strokeWidth: 2,
                        outline: "none",
                      },
                    }}
                  >
                    <title>
                      {stateName}
                      {isAvailable ? " (click to filter)" : " (no photos)"}
                    </title>
                  </Geography>
                );
              })
            }
          </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      )}

      {/* Legend - Only show for World mode */}
      {mapMode === "world" && (
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-300">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-cyan-400/70 border border-cyan-400"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-cyan-400/40 border border-cyan-400/60"></div>
            <span>Has photos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-gray-500/25 border border-gray-500/50"></div>
            <span>No photos</span>
          </div>
        </div>
      )}

      {/* USA mode legend */}
      {mapMode === "usa" && (
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-300">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-cyan-400/70 border border-cyan-400"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-cyan-400/40 border border-cyan-400/60"></div>
            <span>Has photos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-gray-500/25 border border-gray-500/50"></div>
            <span>No photos</span>
          </div>
        </div>
      )}

      {/* Country list for countries with photos - Only show for World mode */}
      {mapMode === "world" && countries.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-700/30">
          <p className="text-xs md:text-[10px] text-gray-500 mb-2">Countries with photos:</p>
          <div className="flex flex-wrap gap-2 md:gap-1.5">
            {countries.map((country) => (
              <button
                key={country}
                onClick={() => onSelectCountry(selectedCountry === country ? null : country)}
                className={`px-3 py-2 md:px-2.5 md:py-1 text-sm md:text-xs rounded transition-colors min-h-[44px] md:min-h-0 ${
                  selectedCountry === country
                    ? "bg-cyan-600/30 border border-cyan-400/50 text-cyan-300"
                    : "bg-gray-800/30 border border-gray-700/30 text-gray-400 hover:bg-gray-700/30 hover:border-gray-600/40"
                }`}
              >
                {country}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-[10px] text-gray-500 text-center mt-3">
        {mapMode === "usa"
          ? "Click a state to filter • Drag to pan • Scroll to zoom"
          : "Click countries to filter • Drag to pan • Scroll to zoom"}
      </p>
    </div>
  );
}
