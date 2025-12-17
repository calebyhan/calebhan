"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PhotoGallery from "@/components/PhotoGallery";
import FilterPanel from "@/components/FilterPanel";
import Navbar from "@/components/Navbar";
import { searchPhotos } from "@/utils/photoSearch";

// Default filter values
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

// Helper function to parse range parameters (e.g., "100-400" -> [100, 400])
function parseRange(paramValue, defaultRange) {
  if (!paramValue) return defaultRange;
  const parts = paramValue.split('-');
  if (parts.length !== 2) return defaultRange;
  const min = parseFloat(parts[0]);
  const max = parseFloat(parts[1]);
  if (isNaN(min) || isNaN(max)) return defaultRange;
  return [min, max];
}

// Helper function to check if a range matches the default
function rangesEqual(range1, range2) {
  return range1[0] === range2[0] && range1[1] === range2[1];
}

// Parse URL parameters into filter state
function parseURLParams(searchParams) {
  return {
    camera: searchParams.get('camera') || null,
    trip: searchParams.get('trip') || null,
    country: searchParams.get('country') || null,
    dateRange: null, // Date range not implemented in URL yet
    iso: parseRange(searchParams.get('iso'), DEFAULT_FILTERS.iso),
    aperture: parseRange(searchParams.get('aperture'), DEFAULT_FILTERS.aperture),
    shutterSpeed: parseRange(searchParams.get('shutterSpeed'), DEFAULT_FILTERS.shutterSpeed),
    focalLength: parseRange(searchParams.get('focalLength'), DEFAULT_FILTERS.focalLength),
  };
}

// Build URL parameters from filter state
function buildURLParams(filters, searchQuery) {
  const params = new URLSearchParams();

  // Add single-value filters
  if (filters.camera) params.set('camera', filters.camera);
  if (filters.trip) params.set('trip', filters.trip);
  if (filters.country) params.set('country', filters.country);

  // Add range filters (only if different from defaults)
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

  // Add search query
  if (searchQuery) params.set('q', searchQuery);

  return params;
}

function PhotographyPageContent() {
  const searchParams = useSearchParams();
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

  // Initialize filters from URL parameters after photos load
  useEffect(() => {
    if (!photos.length || !searchParams) return;

    const urlFilters = parseURLParams(searchParams);
    const urlSearchQuery = searchParams.get('q') || '';

    // Check if there are any URL params to apply
    const hasURLParams = searchParams.toString().length > 0;

    if (hasURLParams) {
      setFilters(urlFilters);
      if (urlSearchQuery) {
        setSearchQuery(urlSearchQuery);
      }
    }
  }, [photos.length, searchParams]);

  // Update URL when filters or search query change
  useEffect(() => {
    if (!photos.length) return; // Don't update URL until photos are loaded

    const debounceTimer = setTimeout(() => {
      const params = buildURLParams(filters, searchQuery);
      const newURL = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;

      // Only update if the URL actually changed
      if (newURL !== window.location.pathname + window.location.search) {
        window.history.replaceState({}, '', newURL);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimer);
  }, [filters, searchQuery, photos.length]);

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

// Wrap in Suspense to handle useSearchParams
export default function PhotographyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading gallery...</div>
      </div>
    }>
      <PhotographyPageContent />
    </Suspense>
  );
}
