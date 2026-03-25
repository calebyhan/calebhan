"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import PhotoGallery from "@/components/PhotoGallery";
import FilterPanel from "@/components/FilterPanel";
import Navbar from "@/components/Navbar";
import { searchPhotos, initSearchModel } from "@/utils/photoSearch";

const DEFAULT_FILTERS = {
  camera: null,
  trip: null,
  dateRange: null,
  country: null,
  iso: [100, 6400],
  aperture: [1.7, 22],
  shutterSpeed: [0.00025, 0.067],
  focalLength: [6, 105],
};

function parseRange(paramValue, defaultRange) {
  if (!paramValue) return defaultRange;
  const parts = paramValue.split('-');
  if (parts.length !== 2) return defaultRange;
  const min = parseFloat(parts[0]);
  const max = parseFloat(parts[1]);
  if (isNaN(min) || isNaN(max)) return defaultRange;
  return [min, max];
}

function rangesEqual(range1, range2) {
  return range1[0] === range2[0] && range1[1] === range2[1];
}

function parseURLParams(searchParams) {
  return {
    camera: searchParams.get('camera') || null,
    trip: searchParams.get('trip') || null,
    country: searchParams.get('country') || null,
    dateRange: null,
    iso: parseRange(searchParams.get('iso'), DEFAULT_FILTERS.iso),
    aperture: parseRange(searchParams.get('aperture'), DEFAULT_FILTERS.aperture),
    shutterSpeed: parseRange(searchParams.get('shutterSpeed'), DEFAULT_FILTERS.shutterSpeed),
    focalLength: parseRange(searchParams.get('focalLength'), DEFAULT_FILTERS.focalLength),
  };
}

function buildURLParams(filters, searchQuery) {
  const params = new URLSearchParams();

  if (filters.camera) params.set('camera', filters.camera);
  if (filters.trip) params.set('trip', filters.trip);
  if (filters.country) params.set('country', filters.country);

  if (!rangesEqual(filters.iso, DEFAULT_FILTERS.iso)) {
    params.set('iso', `${filters.iso[0]}-${filters.iso[1]}`);
  }
  if (!rangesEqual(filters.aperture, DEFAULT_FILTERS.aperture)) {
    params.set('aperture', `${filters.aperture[0]}-${filters.aperture[1]}`);
  }
  if (!rangesEqual(filters.shutterSpeed, DEFAULT_FILTERS.shutterSpeed)) {
    params.set('shutterSpeed', `${filters.shutterSpeed[0]}-${filters.shutterSpeed[1]}`);
  }
  if (!rangesEqual(filters.focalLength, DEFAULT_FILTERS.focalLength)) {
    params.set('focalLength', `${filters.focalLength[0]}-${filters.focalLength[1]}`);
  }

  if (searchQuery) params.set('q', searchQuery);

  return params;
}

export default function PhotographyPageContent({ initialPhotos }) {
  const searchParams = useSearchParams();
  const [photos] = useState(initialPhotos);
  const [filteredPhotos, setFilteredPhotos] = useState(initialPhotos);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // Pre-fetch embeddings cache on page load so first search is instant
  useEffect(() => {
    initSearchModel();
  }, []);

  // Initialize filters from URL parameters on mount
  useEffect(() => {
    if (!searchParams) return;

    const hasURLParams = searchParams.toString().length > 0;
    if (hasURLParams) {
      setFilters(parseURLParams(searchParams));
      const urlSearchQuery = searchParams.get('q') || '';
      if (urlSearchQuery) setSearchQuery(urlSearchQuery);
    }
  }, [searchParams]);

  // Update URL when filters or search query change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      const params = buildURLParams(filters, searchQuery);
      const newURL = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;

      if (newURL !== window.location.pathname + window.location.search) {
        window.history.replaceState({}, '', newURL);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [filters, searchQuery]);

  // Handle search and filters with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchPhotos(searchQuery, filters, photos);
        setFilteredPhotos(results);
      } catch (error) {
        console.error('Search error:', error);
        setFilteredPhotos(photos);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, filters, photos]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="flex pt-16">
        <FilterPanel
          filters={filters}
          setFilters={setFilters}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          photos={photos}
          isOpen={filterPanelOpen}
          setIsOpen={setFilterPanelOpen}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mb-6 md:mb-8">
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
