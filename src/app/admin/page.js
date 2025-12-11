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
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [photos, setPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState(new Set());
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [filter, setFilter] = useState("all");
  const [saving, setSaving] = useState(false);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (authenticated) {
      fetch("/data/photos.json")
        .then(res => res.json())
        .then(data => setPhotos(data))
        .catch(err => console.error("Failed to load photos:", err));
    }
  }, [authenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "admin123") {
      setAuthenticated(true);
    } else {
      alert("Incorrect password");
    }
  };

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
    if (filter === "no-location") return !p.location || !p.location.lat || !p.location.lng;
    if (filter === "no-state") return !p.location?.state;
    if (filter === "no-trip") return !p.trip;
    return true;
  });

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <form onSubmit={handleLogin} className="bg-gray-900 p-8 rounded-lg border border-gray-800">
          <h1 className="text-2xl font-bold mb-4">Admin Access</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-4 py-2 bg-black/30 border border-gray-700 rounded-lg text-white mb-4"
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Photo Admin</h1>
          <div className="px-3 py-1 bg-yellow-900/30 border border-yellow-700 text-yellow-400 rounded text-xs">
            DEV ONLY
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
            onClick={() => setFilter("no-location")}
            className={`px-4 py-2 rounded-lg ${
              filter === "no-location"
                ? "bg-cyan-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            No Location ({photos.filter(p => !p.location || !p.location.lat).length})
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
            No Trip ({photos.filter(p => !p.trip).length})
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
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Trip</label>
                        <input
                          type="text"
                          value={editingPhoto.trip || ""}
                          onChange={(e) => setEditingPhoto({ ...editingPhoto, trip: e.target.value })}
                          className="w-full px-3 py-1.5 bg-black/30 border border-gray-700 rounded text-white text-sm"
                        />
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
