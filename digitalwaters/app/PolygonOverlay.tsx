"use client";

import { useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { useSelector } from "react-redux";
import { RootState } from "../lib/store.ts";

const LeafletPolygonOverlay = () => {
  const map = useMap();
  const [zoomLevel, setZoomLevel] = useState<number | null>(null);
  const polylinesRef = useRef<Record<string, L.Polyline>>({});
  const currentData = useSelector(
    (state: RootState) => state.waterData.currentData
  );
  const coordinates = useSelector(
    (state: RootState) => state.waterData.waterBodyCoordinates
  );

  // Handle map zoom level changes
  useEffect(() => {
    if (map) {
      const handleZoomChange = () => setZoomLevel(map.getZoom());
      map.on("zoomend", handleZoomChange);
      setZoomLevel(map.getZoom());

      return () => {
        map.off("zoomend", handleZoomChange);
      };
    }
  }, [map]);

  // Draw polylines on the map based on updated data
  useEffect(() => {
    if (map && coordinates.length > 0 && zoomLevel !== null && currentData) {
      const strokeWeight =
        zoomLevel > 15 ? 10 : zoomLevel <= 15 && zoomLevel > 10 ? 5 : 1;

      // Clear existing polylines
      Object.values(polylinesRef.current).forEach((line) => {
        line.remove();
      });
      polylinesRef.current = {};

      coordinates.forEach((item, index) => {
        let coordsArray;
        try {
          coordsArray = JSON.parse(item.nearbyGeoCoords);
        } catch {
          return; // Skip if parsing fails
        }

        const polylineKey = `${item.deviceID}-${index}`;

        // Check if current data exists for this device
        if (!currentData[item.deviceID]) return;

        // Parse color data from currentData
        let colorData = currentData[item.deviceID]?.waterColor;
        if (typeof colorData === "string") {
          try {
            const formattedColorData = colorData.replace(/'/g, '"').trim();
            colorData = JSON.parse(formattedColorData);
          } catch (error) {
            console.error("Error parsing color data:", colorData, error);
            return;
          }
        }

        // Convert RGBA to hex color
        const color =
          colorData &&
          typeof colorData === "object" &&
          "r" in colorData &&
          "g" in colorData &&
          "b" in colorData &&
          "a" in colorData
            ? rgba2hex(colorData)
            : "#000000";

        const latLngs = coordsArray.map((coord: { lat: number; lng: number }) => [
          coord.lat,
          coord.lng,
        ]);


        // Create and add the polyline using L.polyline
        const line = L.polyline(latLngs, {
          color,
          weight: strokeWeight,
          fillOpacity: 0.4,
        }).addTo(map);

        // Store reference to the polyline
        polylinesRef.current[polylineKey] = line;
      });

    }
  }, [map, coordinates, zoomLevel, currentData]); // Added `currentData` to dependencies

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      Object.values(polylinesRef.current).forEach((line) => {
        line.remove();
      });
      polylinesRef.current = {};
    };
  }, []);

  // Convert RGBA color to hex format
  function rgba2hex(color: { r: number; g: number; b: number; a: number }) {
    const toHex = (value: number) =>
      Math.round(value).toString(16).padStart(2, "0");
    const redHex = toHex(color.r);
    const greenHex = toHex(color.g);
    const blueHex = toHex(color.b);
    const alphaHex = toHex((color.a / 100) * 255);
    return `#${redHex}${greenHex}${blueHex}${alphaHex}`;
  }

  return null;
};

export default LeafletPolygonOverlay;
