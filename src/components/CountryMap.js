"use client";

import { ComposableMap, Geographies, Geography } from "react-simple-maps";

// TopoJSON data for world map (110m resolution)
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function CountryMap({ selectedCountry, onSelectCountry, countries }) {
  return (
    <div className="bg-black/30 border border-gray-700/50 rounded-lg p-4">
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
          backgroundColor: "rgba(0, 0, 0, 0.4)" // Darker ocean background
        }}
      >
        <Geographies geography={geoUrl}>
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

      {/* Legend */}
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

      {/* Country list for countries with photos */}
      {countries.length > 0 && (
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
        Click countries on the map to filter photos by location
      </p>
    </div>
  );
}
