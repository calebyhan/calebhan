"use client";

import { useState } from "react";
import CountryMap from "./CountryMap";

export default function FilterPanel({ filters, setFilters, searchQuery, setSearchQuery, photos }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Extract unique values for dropdowns
  const cameras = [...new Set(photos.map(p => p.camera).filter(Boolean))];
  const trips = [...new Set(photos.map(p => p.trip).filter(Boolean))];
  const countries = [...new Set(photos.map(p => p.location?.country).filter(Boolean))];

  return (
    <aside className="w-80 bg-gray-900/30 border-r border-gray-800/50 p-6 overflow-y-auto h-screen sticky top-0">
      <h2 className="text-2xl font-bold mb-6">Filters</h2>

      {/* AI Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Search</label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Describe what you're looking for..."
          className="w-full px-4 py-2 bg-black/30 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50"
        />
        <p className="text-xs text-gray-500 mt-1">
          Try &quot;sunset&quot;, &quot;mountains&quot;, &quot;architecture&quot;, etc.
        </p>
      </div>

      {/* Location Map */}
      {countries.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Location</label>
          <CountryMap
            selectedCountry={filters.country}
            onSelectCountry={(country) => setFilters({ ...filters, country })}
            countries={countries}
          />
        </div>
      )}

      {/* Device Filter */}
      {cameras.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Camera</label>
          <select
            value={filters.camera || ''}
            onChange={(e) => setFilters({ ...filters, camera: e.target.value || null })}
            className="w-full px-4 py-2 bg-black/30 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-cyan-400/50"
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
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Trip</label>
          <select
            value={filters.trip || ''}
            onChange={(e) => setFilters({ ...filters, trip: e.target.value || null })}
            className="w-full px-4 py-2 bg-black/30 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-cyan-400/50"
          >
            <option value="">All Trips</option>
            {trips.map(trip => (
              <option key={trip} value={trip}>{trip}</option>
            ))}
          </select>
        </div>
      )}

      {/* Advanced Filters Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white hover:bg-gray-700/50 transition-colors mb-4"
      >
        {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
      </button>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-4 pt-4 border-t border-gray-800/50">
          {/* ISO Range */}
          <div>
            <label className="block text-sm font-medium mb-2">
              ISO: {filters.iso[0]} - {filters.iso[1]}
            </label>
            <p className="text-xs text-gray-500">Range sliders coming soon...</p>
          </div>

          {/* Aperture Range */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Aperture: f/{filters.aperture[0]} - f/{filters.aperture[1]}
            </label>
            <p className="text-xs text-gray-500">Range sliders coming soon...</p>
          </div>
        </div>
      )}

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
        className="w-full mt-6 px-4 py-2 border border-red-400/50 text-red-400 rounded-lg hover:bg-red-900/20 transition-colors"
      >
        Clear All Filters
      </button>
    </aside>
  );
}
