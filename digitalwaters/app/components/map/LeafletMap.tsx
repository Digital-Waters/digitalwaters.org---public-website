"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer } from "react-leaflet";

import React from "react";

function LeafletMap() {
  return (
    <div className="h-5/6 w-4/6 rounded-lg overflow-hidden pb-8">
      <MapContainer
        center={[43.687104,-79.39095966666666]} // Set your map's center
        zoom={12} // Set your desired zoom level
        className="h-5/6"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href='https://osm.org/copyright'>OpenStreetMap</a> contributors"
        />
      </MapContainer>
    </div>
  );
}

export default LeafletMap;
