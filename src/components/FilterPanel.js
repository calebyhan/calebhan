"use client";

import { useState } from "react";
import CountryMap from "./CountryMap";

export default function FilterPanel({ filters, setFilters, searchQuery, setSearchQuery, photos }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Extract unique values for dropdowns
  const cameras = [...new Set(photos.map(p => p.camera).filter(Boolean))];
  const trips = [...new Set(photos.map(p => p.trip).filter(Boolean))];
  // Only include countries from photos that have valid location data (lat/lng)
  const countries = [...new Set(
    photos
      .filter(p => p.location && p.location.lat && p.location.lng && p.location.country)
      .map(p => p.location.country)
  )];
  // Extract unique states from photos that have state data
  const states = [...new Set(
    photos
      .filter(p => p.location && p.location.state)
      .map(p => p.location.state)
  )];

  return (
    <aside
      className="w-80 bg-gray-900/30 border-r border-gray-800/50 p-6 overflow-y-auto h-[calc(100vh-4rem)] sticky top-16"
      style={{
        scrollbarWidth: 'none'
      }}
    >
      <style jsx>{`
        aside::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <h2 className="text-2xl font-bold mb-4">Filters</h2>

      {/* AI Search */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Search</label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Describe what you're looking for..."
          className="w-full px-3 py-2 bg-black/30 border border-gray-700/50 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-400/50"
        />
        <div className="flex items-start gap-1.5 mt-1">
          <p className="text-xs text-gray-500 flex-1">
            Try &quot;sunset&quot;, &quot;beach&quot;, etc.
          </p>
          <div className="group relative flex-shrink-0">
            <svg
              className="w-3.5 h-3.5 text-gray-500 hover:text-gray-400 cursor-help mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="invisible group-hover:visible absolute right-0 top-6 w-64 p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20">
              <p className="text-xs text-white font-semibold mb-2">How AI Search Works</p>
              <p className="text-xs text-gray-300 mb-2">
                Photos are analyzed using AI to generate semantic tags and descriptions.
                Your search query is matched against these using vector embeddings to find
                visually similar content.
              </p>
              <p className="text-xs text-gray-400 italic">
                Note: AI analysis is not 100% accurate and may occasionally misidentify
                subjects or miss certain details.
              </p>
              <div className="absolute right-3 bottom-full w-2 h-2 bg-gray-800 border-l border-t border-gray-700 transform rotate-45 -mb-1"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Map */}
      {countries.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Location</label>
          <CountryMap
            selectedCountry={filters.country}
            onSelectCountry={(country) => setFilters({ ...filters, country })}
            countries={countries}
            states={states}
          />
        </div>
      )}

      {/* Device Filter */}
      {cameras.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Camera</label>
          <select
            value={filters.camera || ''}
            onChange={(e) => setFilters({ ...filters, camera: e.target.value || null })}
            className="w-full px-3 py-2 bg-black/30 border border-gray-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400/50"
          >
            <option value="">All Cameras</option>
            {cameras.map(camera => (
              <option key={camera} value={camera}>{camera}</option>
            ))}
          </select>
        </div>
      )}

      {/* Trip Filter */}
      {trips.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Trip</label>
          <select
            value={filters.trip || ''}
            onChange={(e) => setFilters({ ...filters, trip: e.target.value || null })}
            className="w-full px-3 py-2 bg-black/30 border border-gray-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400/50"
          >
            <option value="">All Trips</option>
            {trips.map(trip => (
              <option key={trip} value={trip}>{trip}</option>
            ))}
          </select>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4">
        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white hover:bg-gray-700/50 transition-colors flex items-center justify-center gap-2"
          title="Advanced Filters"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span className="text-sm">{showAdvanced ? 'Hide' : 'Show'}</span>
        </button>

        {/* Clear Filters */}
        <button
          onClick={() => {
            setFilters({
              camera: null,
              trip: null,
              country: null,
              dateRange: null,
              iso: [100, 6400],
              aperture: [1.7, 22],
              shutterSpeed: [0.00025, 0.067],
              focalLength: [6, 105],
            });
            setSearchQuery('');
          }}
          className="flex-1 px-3 py-2 border border-red-400/50 text-red-400 rounded-lg hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
          title="Clear All Filters"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="text-sm">Clear</span>
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-6 mt-4 pt-4 border-t border-gray-800/50">
          {/* ISO Range */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-medium text-gray-400">ISO</label>
              <span className="text-xs font-mono text-cyan-400">{filters.iso[0]} - {filters.iso[1]}</span>
            </div>
            <div className="relative h-6 flex items-center">
              {/* Background track */}
              <div className="absolute w-full h-1.5 bg-gray-800/50 rounded-full"></div>
              {/* Filled range track */}
              <div
                className="absolute h-1.5 bg-gradient-to-r from-cyan-500/80 to-cyan-400/80 rounded-full"
                style={{
                  left: `${((filters.iso[0] - 100) / (6400 - 100)) * 100}%`,
                  right: `${100 - ((filters.iso[1] - 100) / (6400 - 100)) * 100}%`
                }}
              ></div>
              {/* Min handle slider */}
              <input
                type="range"
                min="100"
                max="6400"
                step="100"
                value={filters.iso[0]}
                onChange={(e) => {
                  const newMin = parseInt(e.target.value);
                  if (newMin <= filters.iso[1]) {
                    setFilters({ ...filters, iso: [newMin, filters.iso[1]] });
                  }
                }}
                className="absolute w-full appearance-none bg-transparent cursor-pointer z-20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-900 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-cyan-500 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-gray-900 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:border-0"
              />
              {/* Max handle slider */}
              <input
                type="range"
                min="100"
                max="6400"
                step="100"
                value={filters.iso[1]}
                onChange={(e) => {
                  const newMax = parseInt(e.target.value);
                  if (newMax >= filters.iso[0]) {
                    setFilters({ ...filters, iso: [filters.iso[0], newMax] });
                  }
                }}
                className="absolute w-full appearance-none bg-transparent cursor-pointer z-20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-900 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-cyan-500 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-gray-900 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:border-0"
              />
            </div>
          </div>

          {/* Aperture Range */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-medium text-gray-400">Aperture</label>
              <span className="text-xs font-mono text-cyan-400">f/{filters.aperture[0]} - f/{filters.aperture[1]}</span>
            </div>
            <div className="relative h-6 flex items-center">
              {/* Background track */}
              <div className="absolute w-full h-1.5 bg-gray-800/50 rounded-full"></div>
              {/* Filled range track */}
              <div
                className="absolute h-1.5 bg-gradient-to-r from-cyan-500/80 to-cyan-400/80 rounded-full"
                style={{
                  left: `${((filters.aperture[0] - 1.7) / (22 - 1.7)) * 100}%`,
                  right: `${100 - ((filters.aperture[1] - 1.7) / (22 - 1.7)) * 100}%`
                }}
              ></div>
              {/* Min handle slider */}
              <input
                type="range"
                min="1.7"
                max="22"
                step="0.1"
                value={filters.aperture[0]}
                onChange={(e) => {
                  const newMin = parseFloat(e.target.value);
                  if (newMin <= filters.aperture[1]) {
                    setFilters({ ...filters, aperture: [newMin, filters.aperture[1]] });
                  }
                }}
                className="absolute w-full appearance-none bg-transparent cursor-pointer z-20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-900 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-cyan-500 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-gray-900 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:border-0"
              />
              {/* Max handle slider */}
              <input
                type="range"
                min="1.7"
                max="22"
                step="0.1"
                value={filters.aperture[1]}
                onChange={(e) => {
                  const newMax = parseFloat(e.target.value);
                  if (newMax >= filters.aperture[0]) {
                    setFilters({ ...filters, aperture: [filters.aperture[0], newMax] });
                  }
                }}
                className="absolute w-full appearance-none bg-transparent cursor-pointer z-20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-900 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-cyan-500 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-gray-900 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:border-0"
              />
            </div>
          </div>

          {/* Shutter Speed Range */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-medium text-gray-400">Shutter Speed</label>
              <span className="text-xs font-mono text-cyan-400">
                {filters.shutterSpeed[0] < 1 ? `1/${Math.round(1/filters.shutterSpeed[0])}s` : `${filters.shutterSpeed[0]}s`} - {filters.shutterSpeed[1] < 1 ? `1/${Math.round(1/filters.shutterSpeed[1])}s` : `${filters.shutterSpeed[1]}s`}
              </span>
            </div>
            <div className="relative h-6 flex items-center">
              {/* Background track */}
              <div className="absolute w-full h-1.5 bg-gray-800/50 rounded-full"></div>
              {/* Filled range track */}
              <div
                className="absolute h-1.5 bg-gradient-to-r from-cyan-500/80 to-cyan-400/80 rounded-full"
                style={{
                  left: `${((filters.shutterSpeed[0] - 0.00025) / (0.067 - 0.00025)) * 100}%`,
                  right: `${100 - ((filters.shutterSpeed[1] - 0.00025) / (0.067 - 0.00025)) * 100}%`
                }}
              ></div>
              {/* Min handle slider */}
              <input
                type="range"
                min="0.00025"
                max="0.067"
                step="0.001"
                value={filters.shutterSpeed[0]}
                onChange={(e) => {
                  const newMin = parseFloat(e.target.value);
                  if (newMin <= filters.shutterSpeed[1]) {
                    setFilters({ ...filters, shutterSpeed: [newMin, filters.shutterSpeed[1]] });
                  }
                }}
                className="absolute w-full appearance-none bg-transparent cursor-pointer z-20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-900 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-cyan-500 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-gray-900 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:border-0"
              />
              {/* Max handle slider */}
              <input
                type="range"
                min="0.00025"
                max="0.067"
                step="0.001"
                value={filters.shutterSpeed[1]}
                onChange={(e) => {
                  const newMax = parseFloat(e.target.value);
                  if (newMax >= filters.shutterSpeed[0]) {
                    setFilters({ ...filters, shutterSpeed: [filters.shutterSpeed[0], newMax] });
                  }
                }}
                className="absolute w-full appearance-none bg-transparent cursor-pointer z-20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-900 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-cyan-500 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-gray-900 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:border-0"
              />
            </div>
          </div>

          {/* Focal Length Range */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-medium text-gray-400">Focal Length</label>
              <span className="text-xs font-mono text-cyan-400">{filters.focalLength[0]}mm - {filters.focalLength[1]}mm</span>
            </div>
            <div className="relative h-6 flex items-center">
              {/* Background track */}
              <div className="absolute w-full h-1.5 bg-gray-800/50 rounded-full"></div>
              {/* Filled range track */}
              <div
                className="absolute h-1.5 bg-gradient-to-r from-cyan-500/80 to-cyan-400/80 rounded-full"
                style={{
                  left: `${((filters.focalLength[0] - 6) / (105 - 6)) * 100}%`,
                  right: `${100 - ((filters.focalLength[1] - 6) / (105 - 6)) * 100}%`
                }}
              ></div>
              {/* Min handle slider */}
              <input
                type="range"
                min="6"
                max="105"
                step="1"
                value={filters.focalLength[0]}
                onChange={(e) => {
                  const newMin = parseFloat(e.target.value);
                  if (newMin <= filters.focalLength[1]) {
                    setFilters({ ...filters, focalLength: [newMin, filters.focalLength[1]] });
                  }
                }}
                className="absolute w-full appearance-none bg-transparent cursor-pointer z-20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-900 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-cyan-500 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-gray-900 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:border-0"
              />
              {/* Max handle slider */}
              <input
                type="range"
                min="6"
                max="105"
                step="1"
                value={filters.focalLength[1]}
                onChange={(e) => {
                  const newMax = parseFloat(e.target.value);
                  if (newMax >= filters.focalLength[0]) {
                    setFilters({ ...filters, focalLength: [filters.focalLength[0], newMax] });
                  }
                }}
                className="absolute w-full appearance-none bg-transparent cursor-pointer z-20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-900 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-cyan-500 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-gray-900 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:border-0"
              />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
