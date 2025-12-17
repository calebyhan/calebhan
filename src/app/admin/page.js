"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

// Dynamically import LocationPicker to avoid SSR issues with Leaflet
const LocationPicker = dynamic(() => import("@/components/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-800 rounded flex items-center justify-center">
      <p className="text-gray-400">Loading map...</p>
    </div>
  ),
});

export default function AdminPage() {
  const [photos, setPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState(new Set());
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [filter, setFilter] = useState("all");
  const [saving, setSaving] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showGeocodeConfirm, setShowGeocodeConfirm] = useState(false);
  const [geocodeCount, setGeocodeCount] = useState(0);
  const [geocodeProgress, setGeocodeProgress] = useState({ current: 0, total: 0 });
  const [showTripDropdown, setShowTripDropdown] = useState(false);
  const [tripSearchQuery, setTripSearchQuery] = useState("");

  useEffect(() => {
    fetch("/data/photos.json")
      .then(res => res.json())
      .then(data => setPhotos(data))
      .catch(err => console.error("Failed to load photos:", err));
  }, []);

  const handlePhotoClick = (photo) => {
    setEditingPhoto({ ...photo });
  };

  const handleBulkSelect = (photoId) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId);
    } else {
      newSelected.add(photoId);
    }
    setSelectedPhotos(newSelected);
  };

  const handleSavePhoto = async () => {
    setSaving(true);
    try {
      const updatedPhotos = photos.map(p =>
        p.id === editingPhoto.id ? editingPhoto : p
      );

      const response = await fetch("/api/admin/save-photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photos: updatedPhotos })
      });

      if (response.ok) {
        setPhotos(updatedPhotos);
        setEditingPhoto(null);
        alert("Saved successfully!");
      } else {
        alert("Failed to save");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving changes");
    } finally {
      setSaving(false);
    }
  };

  const handleAutoGeocode = async () => {
    if (!editingPhoto.location?.lat || !editingPhoto.location?.lng) {
      alert("No GPS coordinates available");
      return;
    }

    setSaving(true);
    try {
      const { lat, lng } = editingPhoto.location;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        {
          headers: {
            'User-Agent': 'PhotoGalleryAdmin/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error("Geocoding failed");
      }

      const data = await response.json();
      const address = data.address || {};

      setEditingPhoto({
        ...editingPhoto,
        location: {
          ...editingPhoto.location,
          country: address.country || editingPhoto.location.country,
          state: address.state || editingPhoto.location.state,
        }
      });

      alert("Location auto-filled! Click Save to keep changes.");
    } catch (err) {
      console.error("Geocoding error:", err);
      alert("Failed to get location from GPS coordinates");
    } finally {
      setSaving(false);
    }
  };

  const handleBulkAutoGeocode = () => {
    const photosWithGPS = photos.filter(p => p.location?.lat && p.location?.lng);

    if (photosWithGPS.length === 0) {
      alert(`No photos with GPS coordinates found.\n\nTotal photos: ${photos.length}`);
      return;
    }

    setGeocodeCount(photosWithGPS.length);
    setShowGeocodeConfirm(true);
  };

  const executeBulkGeocode = async () => {
    setShowGeocodeConfirm(false);
    const photosWithGPS = photos.filter(p => p.location?.lat && p.location?.lng);

    setSaving(true);
    setGeocodeProgress({ current: 0, total: photosWithGPS.length });
    let updatedPhotos = [...photos];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < photosWithGPS.length; i++) {
      const photo = photosWithGPS[i];
      setGeocodeProgress({ current: i + 1, total: photosWithGPS.length });

      try {
        const { lat, lng } = photo.location;
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
          {
            headers: {
              'User-Agent': 'PhotoGalleryAdmin/1.0'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          const address = data.address || {};

          // Update photo in the array
          const photoIndex = updatedPhotos.findIndex(p => p.id === photo.id);
          if (photoIndex !== -1) {
            updatedPhotos[photoIndex] = {
              ...updatedPhotos[photoIndex],
              location: {
                ...updatedPhotos[photoIndex].location,
                country: address.country || updatedPhotos[photoIndex].location.country,
                state: address.state || updatedPhotos[photoIndex].location.state,
              }
            };
            successCount++;
          }
        } else {
          errorCount++;
        }

        // Rate limiting: wait 1.2 seconds between requests
        if (i < photosWithGPS.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1200));
        }
      } catch (err) {
        console.error(`Geocoding error for photo ${photo.id}:`, err);
        errorCount++;
      }
    }

    // Save all updates
    try {
      const response = await fetch("/api/admin/save-photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photos: updatedPhotos })
      });

      if (response.ok) {
        setPhotos(updatedPhotos);
        setGeocodeProgress({ current: 0, total: 0 });
        alert(
          `Bulk auto-geocoding complete!\n\n` +
          `✓ Success: ${successCount}\n` +
          `✗ Errors: ${errorCount}`
        );
      } else {
        alert("Failed to save changes");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving changes");
    } finally {
      setSaving(false);
      setGeocodeProgress({ current: 0, total: 0 });
    }
  };

  const handleBulkEdit = async (field, value) => {
    setSaving(true);
    try {
      const updatedPhotos = photos.map(p => {
        if (selectedPhotos.has(p.id)) {
          if (field === "location.state" || field === "location.country") {
            const [parent, child] = field.split(".");
            return {
              ...p,
              [parent]: {
                ...p[parent],
                [child]: value
              }
            };
          }
          return { ...p, [field]: value };
        }
        return p;
      });

      const response = await fetch("/api/admin/save-photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photos: updatedPhotos })
      });

      if (response.ok) {
        setPhotos(updatedPhotos);
        setSelectedPhotos(new Set());
        alert(`Updated ${selectedPhotos.size} photos!`);
      } else {
        alert("Failed to save");
      }
    } catch (err) {
      console.error("Bulk edit error:", err);
      alert("Error saving changes");
    } finally {
      setSaving(false);
    }
  };

  const filteredPhotos = photos.filter(p => {
    if (filter === "no-state") return !p.location?.state;
    if (filter === "no-trip") return !p.trip || p.trip === "Uncategorized";
    return true;
  });

  // Get unique trips for dropdown
  const uniqueTrips = [...new Set(
    photos
      .map(p => p.trip)
      .filter(t => t && t !== "Uncategorized")
  )].sort();

  // Filter trips based on search query
  const filteredTrips = uniqueTrips.filter(trip =>
    trip.toLowerCase().includes(tripSearchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Geocode Confirmation Modal */}
      {showGeocodeConfirm && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md border border-gray-800">
            <h2 className="text-xl font-bold mb-4">Confirm Auto-Geocoding</h2>
            <p className="text-gray-300 mb-2">
              Auto-geocode <span className="text-cyan-400 font-semibold">{geocodeCount}</span> photos with GPS coordinates?
            </p>
            <p className="text-sm text-gray-400 mb-6">
              This will take about {Math.ceil(geocodeCount * 1.2)} seconds due to rate limiting (1 request/second).
            </p>
            <div className="flex gap-3">
              <button
                onClick={executeBulkGeocode}
                className="flex-1 px-4 py-2 bg-green-900/30 border border-green-700 text-green-400 rounded-lg hover:bg-green-900/50"
              >
                Start Geocoding
              </button>
              <button
                onClick={() => setShowGeocodeConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Modal */}
      {geocodeProgress.total > 0 && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full border border-gray-800">
            <h2 className="text-xl font-bold mb-4">Geocoding in Progress...</h2>
            <p className="text-gray-300 mb-4">
              Processing photo {geocodeProgress.current} of {geocodeProgress.total}
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-gray-800 rounded-full h-4 mb-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-600 to-cyan-600 h-full transition-all duration-300 flex items-center justify-center text-xs font-semibold"
                style={{ width: `${(geocodeProgress.current / geocodeProgress.total) * 100}%` }}
              >
                {Math.round((geocodeProgress.current / geocodeProgress.total) * 100)}%
              </div>
            </div>

            <p className="text-sm text-gray-400 text-center mt-2">
              Please wait, this may take a few minutes...
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Photo Admin</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBulkAutoGeocode}
              disabled={saving}
              className="px-4 py-2 bg-green-900/30 border border-green-700 text-green-400 rounded-lg hover:bg-green-900/50 disabled:opacity-50 text-sm"
            >
              Auto-Geocode All GPS Photos
            </button>
            <div className="px-3 py-1 bg-yellow-900/30 border border-yellow-700 text-yellow-400 rounded text-xs">
              DEV ONLY
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg ${
              filter === "all"
                ? "bg-cyan-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            All ({photos.length})
          </button>
          <button
            onClick={() => setFilter("no-state")}
            className={`px-4 py-2 rounded-lg ${
              filter === "no-state"
                ? "bg-cyan-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            No State ({photos.filter(p => !p.location?.state).length})
          </button>
          <button
            onClick={() => setFilter("no-trip")}
            className={`px-4 py-2 rounded-lg ${
              filter === "no-trip"
                ? "bg-cyan-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            No Trip ({photos.filter(p => !p.trip || p.trip === "Uncategorized").length})
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedPhotos.size > 0 && (
          <div className="mb-6 p-4 bg-gray-900 border border-gray-800 rounded-lg">
            <p className="mb-3 text-sm text-gray-400">{selectedPhotos.size} photos selected</p>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Set state..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value) {
                    handleBulkEdit("location.state", e.target.value);
                    e.target.value = "";
                  }
                }}
                className="px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white text-sm"
              />
              <input
                type="text"
                placeholder="Set country..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value) {
                    handleBulkEdit("location.country", e.target.value);
                    e.target.value = "";
                  }
                }}
                className="px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white text-sm"
              />
              <input
                type="text"
                placeholder="Set trip..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value) {
                    handleBulkEdit("trip", e.target.value);
                    e.target.value = "";
                  }
                }}
                className="px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white text-sm"
              />
              <button
                onClick={() => setSelectedPhotos(new Set())}
                className="px-4 py-2 bg-red-900/30 border border-red-700 text-red-400 rounded-lg hover:bg-red-900/50 text-sm"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Photo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className={`relative group cursor-pointer border-2 rounded-lg overflow-hidden ${
                selectedPhotos.has(photo.id)
                  ? "border-cyan-400"
                  : "border-transparent"
              }`}
            >
              <Image
                src={photo.path}
                alt={photo.id}
                width={200}
                height={200}
                className="w-full h-40 object-cover"
                onClick={() => handlePhotoClick(photo)}
              />
              <div className="absolute top-2 left-2">
                <input
                  type="checkbox"
                  checked={selectedPhotos.has(photo.id)}
                  onChange={() => handleBulkSelect(photo.id)}
                  className="w-5 h-5"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handlePhotoClick(photo)}
                  className="px-3 py-1 bg-cyan-600 text-white rounded text-sm"
                >
                  Edit
                </button>
              </div>
              {(!photo.location?.state || !photo.trip) && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
              )}
            </div>
          ))}
        </div>

        {/* Edit Modal */}
        {editingPhoto && (
          <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-6 z-50">
            <div className="bg-gray-900 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex gap-6">
                <div className="flex-1">
                  <Image
                    src={editingPhoto.path}
                    alt={editingPhoto.id}
                    width={editingPhoto.width}
                    height={editingPhoto.height}
                    className="w-full h-auto rounded"
                  />
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[80vh]">
                  <h2 className="text-xl font-bold mb-4">Edit Photo</h2>

                  {/* Camera Details Section */}
                  <div className="border-b border-gray-800 pb-3">
                    <h3 className="text-sm font-semibold text-gray-300 mb-2">Camera Details</h3>

                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Camera</label>
                        <input
                          type="text"
                          value={editingPhoto.camera || ""}
                          onChange={(e) => setEditingPhoto({ ...editingPhoto, camera: e.target.value })}
                          className="w-full px-3 py-1.5 bg-black/30 border border-gray-700 rounded text-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Lens</label>
                        <input
                          type="text"
                          value={editingPhoto.lens || ""}
                          onChange={(e) => setEditingPhoto({ ...editingPhoto, lens: e.target.value })}
                          className="w-full px-3 py-1.5 bg-black/30 border border-gray-700 rounded text-white text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">ISO</label>
                          <input
                            type="number"
                            value={editingPhoto.iso || ""}
                            onChange={(e) => setEditingPhoto({ ...editingPhoto, iso: e.target.value ? parseInt(e.target.value) : null })}
                            className="w-full px-3 py-1.5 bg-black/30 border border-gray-700 rounded text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Aperture (f/)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={editingPhoto.aperture || ""}
                            onChange={(e) => setEditingPhoto({ ...editingPhoto, aperture: e.target.value ? parseFloat(e.target.value) : null })}
                            className="w-full px-3 py-1.5 bg-black/30 border border-gray-700 rounded text-white text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Shutter Speed (s)</label>
                          <input
                            type="number"
                            step="0.001"
                            value={editingPhoto.shutterSpeed || ""}
                            onChange={(e) => setEditingPhoto({ ...editingPhoto, shutterSpeed: e.target.value ? parseFloat(e.target.value) : null })}
                            className="w-full px-3 py-1.5 bg-black/30 border border-gray-700 rounded text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Focal Length (mm)</label>
                          <input
                            type="number"
                            value={editingPhoto.focalLength || ""}
                            onChange={(e) => setEditingPhoto({ ...editingPhoto, focalLength: e.target.value ? parseInt(e.target.value) : null })}
                            className="w-full px-3 py-1.5 bg-black/30 border border-gray-700 rounded text-white text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* GPS & Location Section */}
                  <div className="border-b border-gray-800 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-300">GPS & Location</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowMap(!showMap)}
                          className="px-3 py-1 text-xs bg-blue-900/30 border border-blue-700 text-blue-400 rounded hover:bg-blue-900/50"
                        >
                          {showMap ? "Hide Map" : "Show Map"}
                        </button>
                        {editingPhoto.location?.lat && editingPhoto.location?.lng && (
                          <button
                            onClick={handleAutoGeocode}
                            disabled={saving}
                            className="px-3 py-1 text-xs bg-green-900/30 border border-green-700 text-green-400 rounded hover:bg-green-900/50 disabled:opacity-50"
                          >
                            Auto-fill from GPS
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {showMap && (
                        <div className="mb-3">
                          <LocationPicker
                            lat={editingPhoto.location?.lat}
                            lng={editingPhoto.location?.lng}
                            onLocationChange={(lat, lng) => {
                              setEditingPhoto({
                                ...editingPhoto,
                                location: {
                                  ...editingPhoto.location,
                                  lat: lat,
                                  lng: lng
                                }
                              });
                            }}
                          />
                          <p className="text-xs text-gray-500 mt-1">Click on the map to set coordinates</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Latitude</label>
                          <input
                            type="number"
                            step="0.000001"
                            value={editingPhoto.location?.lat || ""}
                            onChange={(e) => setEditingPhoto({
                              ...editingPhoto,
                              location: { ...editingPhoto.location, lat: e.target.value ? parseFloat(e.target.value) : null }
                            })}
                            className="w-full px-3 py-1.5 bg-black/30 border border-gray-700 rounded text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Longitude</label>
                          <input
                            type="number"
                            step="0.000001"
                            value={editingPhoto.location?.lng || ""}
                            onChange={(e) => setEditingPhoto({
                              ...editingPhoto,
                              location: { ...editingPhoto.location, lng: e.target.value ? parseFloat(e.target.value) : null }
                            })}
                            className="w-full px-3 py-1.5 bg-black/30 border border-gray-700 rounded text-white text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Country</label>
                        <input
                          type="text"
                          value={editingPhoto.location?.country || ""}
                          onChange={(e) => setEditingPhoto({
                            ...editingPhoto,
                            location: { ...editingPhoto.location, country: e.target.value }
                          })}
                          className="w-full px-3 py-1.5 bg-black/30 border border-gray-700 rounded text-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 mb-1">State</label>
                        <input
                          type="text"
                          value={editingPhoto.location?.state || ""}
                          onChange={(e) => setEditingPhoto({
                            ...editingPhoto,
                            location: { ...editingPhoto.location, state: e.target.value }
                          })}
                          className="w-full px-3 py-1.5 bg-black/30 border border-gray-700 rounded text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Other Metadata */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-2">Other Metadata</h3>

                    <div className="space-y-2">
                      <div className="relative">
                        <label className="block text-xs text-gray-400 mb-1">Trip</label>
                        <input
                          type="text"
                          value={editingPhoto.trip || ""}
                          onChange={(e) => {
                            setEditingPhoto({ ...editingPhoto, trip: e.target.value });
                            setTripSearchQuery(e.target.value);
                            setShowTripDropdown(true);
                          }}
                          onFocus={() => {
                            setTripSearchQuery(editingPhoto.trip || "");
                            setShowTripDropdown(true);
                          }}
                          onBlur={() => {
                            // Delay to allow click on dropdown items
                            setTimeout(() => setShowTripDropdown(false), 200);
                          }}
                          placeholder="Type to search or create new..."
                          className="w-full px-3 py-1.5 bg-black/30 border border-gray-700 rounded text-white text-sm"
                        />

                        {/* Dropdown */}
                        {showTripDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {filteredTrips.length > 0 ? (
                              <>
                                {filteredTrips.map((trip) => (
                                  <button
                                    key={trip}
                                    type="button"
                                    onClick={() => {
                                      setEditingPhoto({ ...editingPhoto, trip });
                                      setShowTripDropdown(false);
                                      setTripSearchQuery("");
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-700 text-white text-sm border-b border-gray-700/50 last:border-b-0"
                                  >
                                    {trip}
                                  </button>
                                ))}
                              </>
                            ) : tripSearchQuery && tripSearchQuery !== "Uncategorized" ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPhoto({ ...editingPhoto, trip: tripSearchQuery });
                                  setShowTripDropdown(false);
                                  setTripSearchQuery("");
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-gray-700 text-cyan-400 text-sm"
                              >
                                + Create "{tripSearchQuery}"
                              </button>
                            ) : (
                              <div className="px-3 py-2 text-gray-500 text-sm">
                                {uniqueTrips.length === 0 ? "No existing trips" : "No matches found"}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Manual Tags (comma-separated)</label>
                        <input
                          type="text"
                          value={editingPhoto.manualTags?.join(", ") || ""}
                          onChange={(e) => setEditingPhoto({
                            ...editingPhoto,
                            manualTags: e.target.value.split(",").map(t => t.trim()).filter(Boolean)
                          })}
                          className="w-full px-3 py-1.5 bg-black/30 border border-gray-700 rounded text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3 sticky bottom-0 bg-gray-900">
                    <button
                      onClick={handleSavePhoto}
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => setEditingPhoto(null)}
                      className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="pt-2 text-xs text-gray-500">
                    <p>ID: {editingPhoto.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
