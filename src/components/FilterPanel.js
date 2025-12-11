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
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(55, 65, 81, 0.5) rgba(17, 24, 39, 0.5)'
      }}
    >
      <style jsx>{`
        aside::-webkit-scrollbar {
          width: 6px;
        }
        aside::-webkit-scrollbar-track {
          background: rgba(17, 24, 39, 0.5);
        }
        aside::-webkit-scrollbar-thumb {
          background: rgba(55, 65, 81, 0.5);
          border-radius: 3px;
        }
        aside::-webkit-scrollbar-thumb:hover {
          background: rgba(75, 85, 99, 0.7);
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
            Try &quot;sunset&quot;, &quot;mountains&quot;, etc.
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
              iso: [100, 12800],
              aperture: [1.4, 22],
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
        <div className="space-y-3 mt-4 pt-4 border-t border-gray-800/50">
          {/* ISO Range */}
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-400">
              ISO: {filters.iso[0]} - {filters.iso[1]}
            </label>
            <p className="text-[10px] text-gray-500">Range sliders coming soon...</p>
          </div>

          {/* Aperture Range */}
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-400">
              Aperture: f/{filters.aperture[0]} - f/{filters.aperture[1]}
            </label>
            <p className="text-[10px] text-gray-500">Range sliders coming soon...</p>
          </div>
        </div>
      )}
    </aside>
  );
}
