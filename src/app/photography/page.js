"use client";

import { useState, useEffect } from "react";
import PhotoGallery from "@/components/PhotoGallery";
import FilterPanel from "@/components/FilterPanel";
import Navbar from "@/components/Navbar";
import { searchPhotos } from "@/utils/photoSearch";

export default function PhotographyPage() {
  const [photos, setPhotos] = useState([]);
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState({
    camera: null,
    trip: null,
    dateRange: null,
    country: null,
    iso: [100, 6400],
    aperture: [1.7, 22],
    shutterSpeed: [0.00025, 0.067],
    focalLength: [6, 105],
  });

  // Load photos on mount
  useEffect(() => {
    async function loadPhotos() {
      const response = await fetch('/data/photos.json');
      const data = await response.json();
      setPhotos(data);
      setFilteredPhotos(data);
      setLoading(false);
    }
    loadPhotos();
  }, []);

  // Handle search and filters with debouncing
  useEffect(() => {
    if (!photos.length) return;

    // Debounce search to reduce lag (500ms delay)
    const debounceTimer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchPhotos(searchQuery, filters, photos);
        setFilteredPhotos(results);
      } catch (error) {
        console.error('Search error:', error);
        setFilteredPhotos(photos); // Fallback to all photos on error
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, filters, photos]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading gallery...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="flex pt-16">
        {/* Filter Sidebar */}
        <FilterPanel
          filters={filters}
          setFilters={setFilters}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          photos={photos}
          isOpen={filterPanelOpen}
          setIsOpen={setFilterPanelOpen}
        />

        {/* Main Gallery */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mb-6 md:mb-8">
            {/* Mobile filter button */}
            <div className="flex items-center gap-3 mb-4 lg:hidden">
              <button
                onClick={() => setFilterPanelOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600/20 border border-cyan-400/50 text-cyan-300 rounded-lg hover:bg-cyan-600/30 transition-colors"
                aria-label="Open filters"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="font-medium">Filters</span>
              </button>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-2">Photography</h1>
            <p className="text-gray-400">
              {searching ? (
                <span>Searching...</span>
              ) : (
                <span>{filteredPhotos.length} {filteredPhotos.length === 1 ? 'photo' : 'photos'}</span>
              )}
            </p>
          </div>

          <PhotoGallery photos={filteredPhotos} />
        </main>
      </div>
    </div>
  );
}
