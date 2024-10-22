"use client"

import { useEffect, useRef, useState } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

interface PolygonOverlayProps {
  coordinates: google.maps.LatLngLiteral[][];
}

const PolygonOverlay: React.FC<PolygonOverlayProps> = ({ coordinates, colors }) => {
  const map = useMap();
  const [zoomLevel, setZoomLevel] = useState<number | null>(null);
  const polygonsRef = useRef<google.maps.Polygon[]>([]);

  useEffect(() => {
    if (map) {
      const handleZoomChange = () => {
        const zoom = map.getZoom();
        setZoomLevel(zoom);
      };

      const zoomListener = window.google.maps.event.addListener(map, 'zoom_changed', handleZoomChange);

      setZoomLevel(map.getZoom());

      return () => {
        window.google.maps.event.removeListener(zoomListener);
      };
    }
  }, [map]);
  useEffect(() => {
    if (map && coordinates.length > 0 && zoomLevel !== null) {
      const strokeWeight = zoomLevel > 15 ? 15 : zoomLevel <= 15 && zoomLevel > 10 ? 5 : 1;
  
      // Clear previous polygons before drawing new ones
      polygonsRef.current.forEach((polygon) => {
        polygon.setMap(null); // Remove the existing polygons from the map
      });
      polygonsRef.current = [];
  
      // Draw the polygons with the updated colors
      coordinates.forEach((items) => {
        const completePath = [...items.geometry, ...items.geometry.slice().reverse()];
  
        let colorData = colors[items.deviceID];
  
        // Log the raw color data for debugging
        console.log("Raw color data:", colorData);
  
        // Convert the color data string to an object if it's a string
        if (typeof colorData === 'string') {
          try {
            // Replace single quotes with double quotes and handle any extra issues
            const formattedColorData = colorData.replace(/'/g, '"').trim(); // Trim to remove unwanted spaces
            colorData = JSON.parse(formattedColorData); // Parse as JSON
          } catch (error) {
            console.error("Error parsing color data:", colorData, error);
            return; // Skip this polygon if parsing fails
          }
        }
  
        // Check if the color is now a valid object with r, g, b, a keys
        if (typeof colorData === 'object' && 'r' in colorData && 'g' in colorData && 'b' in colorData && 'a' in colorData) {
          const color = rgba2hex(colorData); // Convert color object to hex
          console.log("Parsed and valid color:", color);
  
          const polygon = new window.google.maps.Polygon({
            paths: completePath,
            strokeColor: `${color}`,
            strokeOpacity: 1.0,
            strokeWeight,
            fillColor: `${color}`,
            fillOpacity: 1.0,
          });
  
          polygon.setMap(map);
          polygonsRef.current.push(polygon);
        } else {
          console.error("Invalid color data for deviceID:", items.deviceID);
        }
      });
    }
  }, [map, coordinates, zoomLevel, colors]);
  
  function rgba2hex(color: { r: number, g: number, b: number, a: number }) {
    const toHex = (value: number) => Math.round(value).toString(16).padStart(2, '0');
  
    const redHex = toHex(color.r);
    const greenHex = toHex(color.g);
    const blueHex = toHex(color.b);
  
    // Alpha value is assumed to be from 0 to 100, so we need to scale it to 0-255
    const alphaHex = toHex((color.a / 100) * 255);
  
    // Return the full hex code with alpha
    return `#${redHex}${greenHex}${blueHex}${alphaHex}`;
  }
  
  useEffect(() => {
    return () => {
      polygonsRef.current.forEach((polygon) => {
        polygon.setMap(null);
      });
      polygonsRef.current = [];
    };
  }, []);

  return null;
};


export default PolygonOverlay;
