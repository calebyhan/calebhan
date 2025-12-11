"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";

export default function PhotoGallery({ photos }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const modalRef = useRef(null);

  const openPhoto = useCallback((photo) => {
    setSelectedPhoto(photo);
  }, []);

  const closePhoto = useCallback(() => {
    setSelectedPhoto(null);
  }, []);

  // Handle click outside to close
  useEffect(() => {
    if (!selectedPhoto) return;

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        closePhoto();
      }
    };

    // Add event listener after a small delay to prevent immediate closing
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedPhoto, closePhoto]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closePhoto();
      }
    };

    if (selectedPhoto) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [selectedPhoto, closePhoto]);

  return (
    <>
      {/* Masonry Grid */}
      <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-2 md:gap-4 space-y-2 md:space-y-4">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-lg"
            onClick={() => openPhoto(photo)}
          >
            <Image
              src={photo.path}
              alt={`Photo ${index + 1}`}
              width={photo.width}
              height={photo.height}
              className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
            />

            {/* Hover overlay with metadata */}
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
              <p className="text-sm text-white/90">{photo.camera}</p>
              {photo.trip && (
                <p className="text-xs text-white/70">{photo.trip}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-2 md:p-4 overflow-y-auto">
          <div ref={modalRef} className="max-w-7xl w-full flex flex-col lg:flex-row gap-4 md:gap-6 my-auto max-h-[96vh] lg:max-h-[90vh]">
            {/* Photo */}
            <div className="flex-1 flex items-center justify-center min-h-0">
              <Image
                src={selectedPhoto.path}
                alt={selectedPhoto.id}
                width={selectedPhoto.width}
                height={selectedPhoto.height}
                className="max-w-full max-h-[50vh] lg:max-h-[80vh] w-auto h-auto object-contain"
              />
            </div>

            {/* Photo Details Sidebar */}
            <div className="lg:w-80 bg-gray-900/50 rounded-lg p-4 lg:p-6 overflow-y-auto max-h-[40vh] lg:max-h-full">
              <h3 className="text-xl font-bold mb-4">Photo Details</h3>

              {/* Camera Info */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Camera</h4>
                <p className="text-white">{selectedPhoto.camera}</p>
                {selectedPhoto.lens && (
                  <p className="text-sm text-gray-300">{selectedPhoto.lens}</p>
                )}
              </div>

              {/* Technical Settings */}
              {(selectedPhoto.iso || selectedPhoto.aperture || selectedPhoto.shutterSpeed || selectedPhoto.focalLength) && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Settings</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {selectedPhoto.iso && (
                      <div>
                        <span className="text-gray-500">ISO:</span>
                        <span className="ml-2 text-white">{selectedPhoto.iso}</span>
                      </div>
                    )}
                    {selectedPhoto.aperture && (
                      <div>
                        <span className="text-gray-500">Aperture:</span>
                        <span className="ml-2 text-white">f/{selectedPhoto.aperture}</span>
                      </div>
                    )}
                    {selectedPhoto.shutterSpeed && (
                      <div>
                        <span className="text-gray-500">Shutter:</span>
                        <span className="ml-2 text-white">
                          {selectedPhoto.shutterSpeed < 1
                            ? `1/${Math.round(1/selectedPhoto.shutterSpeed)}s`
                            : `${selectedPhoto.shutterSpeed}s`}
                        </span>
                      </div>
                    )}
                    {selectedPhoto.focalLength && (
                      <div>
                        <span className="text-gray-500">Focal:</span>
                        <span className="ml-2 text-white">{selectedPhoto.focalLength}mm</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Date */}
              {selectedPhoto.date && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Date</h4>
                  <p className="text-white">{new Date(selectedPhoto.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
              )}

              {/* Location */}
              {selectedPhoto.location && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Location</h4>
                  <p className="text-white">{selectedPhoto.location.country}</p>
                  <p className="text-xs text-gray-500">
                    {selectedPhoto.location.lat.toFixed(4)}, {selectedPhoto.location.lng.toFixed(4)}
                  </p>
                </div>
              )}

              {/* Trip */}
              {selectedPhoto.trip && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Trip</h4>
                  <p className="text-white">{selectedPhoto.trip}</p>
                </div>
              )}

              <p className="text-xs text-gray-500 text-center mt-6">
                Click outside or press ESC to close
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
