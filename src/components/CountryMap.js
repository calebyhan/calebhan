"use client";

import { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

// TopoJSON data URLs
const worldGeoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const usaStatesGeoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

export default function CountryMap({ selectedCountry, onSelectCountry, countries, states }) {
  // Check if there are any US photos
  const hasUSPhotos = countries.includes("United States");

  // Default to USA States if US photos exist, otherwise World
  const [mapMode, setMapMode] = useState(hasUSPhotos ? "usa" : "world");

  // Use states array if provided, otherwise empty
  const availableStates = states || [];

  return (
    <div className="bg-black/30 border border-gray-700/50 rounded-lg p-4">
      {/* Map Mode Toggle */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setMapMode("usa")}
          disabled={!hasUSPhotos}
          className={`flex-1 px-3 py-1.5 text-xs rounded transition-colors ${
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
          onClick={() => setMapMode("world")}
          className={`flex-1 px-3 py-1.5 text-xs rounded transition-colors ${
            mapMode === "world"
              ? "bg-cyan-600/30 border border-cyan-400/50 text-cyan-300"
              : "bg-gray-800/30 border border-gray-700/30 text-gray-400 hover:bg-gray-700/30"
          }`}
        >
          World
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
          <Geographies geography={worldGeoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryName = geo.properties.name;
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
                      {countryName}
                      {isAvailable ? " (click to filter)" : " (no photos)"}
                    </title>
                  </Geography>
                );
              })
            }
          </Geographies>
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
          <p className="text-xs text-gray-500 mb-2">Countries with photos:</p>
          <div className="flex flex-wrap gap-1.5">
            {countries.map((country) => (
              <button
                key={country}
                onClick={() => onSelectCountry(selectedCountry === country ? null : country)}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
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
          ? "Click a state to filter photos by location"
          : "Click countries on the map to filter photos by location"}
      </p>
    </div>
  );
}
