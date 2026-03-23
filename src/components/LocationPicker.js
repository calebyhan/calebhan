"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function LocationMarker({ position, onLocationChange }) {
  useMapEvents({
    click(e) {
      onLocationChange?.(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function LocationPicker({ lat, lng, onLocationChange }) {
  const position = useMemo(() => {
    return lat && lng ? [lat, lng] : [37.7749, -122.4194];
  }, [lat, lng]);

  return (
    <div className="w-full h-64 rounded overflow-hidden border border-gray-700">
      <MapContainer
        center={position}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} onLocationChange={onLocationChange} />
      </MapContainer>
    </div>
  );
}
