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
        let coordsArray;

        // Validate and parse nearbyGeoCoords
        try {
          coordsArray = JSON.parse(items.nearbyGeoCoords);
        } catch (error) {
          console.error("Error parsing nearbyGeoCoords:", items.nearbyGeoCoords, error);
          return; // Skip if parsing fails 
        }

        const completePath = [...coordsArray.map(coord => ({
          lat: coord.lat,
          lng: coord.lng,
        })), ...coordsArray.slice().reverse().map(coord => ({
          lat: coord.lat,
          lng: coord.lng,
        }))];
        //if(items.deviceID in )
        let colorData = colors[items.deviceID];
  
        // Convert the color data string to an object if it's a string
        if (typeof colorData === 'string') {
          try {
            const formattedColorData = colorData.replace(/'/g, '"').trim();
            colorData = JSON.parse(formattedColorData);
          } catch (error) {
            console.error("Error parsing color data:", colorData, error);
            return; // Skip this polygon if parsing fails
          }
        }
  
        // Check if the color is a valid object
        if (typeof colorData === 'object' && 'r' in colorData && 'g' in colorData && 'b' in colorData && 'a' in colorData && items.deviceID in colors) {
          const color = rgba2hex(colorData); // Convert color object to hex
  
  
          const polygon = new window.google.maps.Polygon({
            paths: completePath,
            strokeColor: color, // You can hardcode "#ff0000ff" (red) to test
            strokeOpacity: 1.0,
            strokeWeight,
            fillColor: color, // You can hardcode "#ff0000ff" (red) to test
            fillOpacity: 1.0,
          });
  
  
          polygon.setMap(map);
          polygonsRef.current.push(polygon);
      } else {
          null; 
       }
      });
    }
  }, [map, coordinates, zoomLevel, colors]);
  
  useEffect(() => {
    return () => {
      polygonsRef.current.forEach((polygon) => {
        polygon.setMap(null);
      });
      polygonsRef.current = [];
    };
  }, []);

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

  return null;
};


export default PolygonOverlay;