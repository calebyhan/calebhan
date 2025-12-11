"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export default function PhotoGallery({ photos }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const openLightbox = useCallback((index) => {
    setPhotoIndex(index);
    setLightboxOpen(true);
  }, []);

  return (
    <>
      {/* Masonry Grid */}
      <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-lg"
            onClick={() => openLightbox(index)}
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

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={photoIndex}
        slides={photos.map(photo => ({
          src: photo.path,
          width: photo.width,
          height: photo.height,
        }))}
      />
    </>
  );
}
