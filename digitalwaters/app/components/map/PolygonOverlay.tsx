import { useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import { Polygon } from "leaflet";

const LeafletPolygonOverlay = ({ coordinates, colors }) => {
  const map = useMap();
  const [zoomLevel, setZoomLevel] = useState(null);
  const polygonsRef = useRef([]);

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

  useEffect(() => {
    if (map && coordinates.length > 0 && zoomLevel !== null) {
      const strokeWeight = zoomLevel > 15 ? 10 : zoomLevel <= 15 && zoomLevel > 10 ? 5 : 1;

      // Clear previous polygons
      polygonsRef.current.forEach((polygon) => {
        map.removeLayer(polygon);
      });
      polygonsRef.current = [];

      coordinates.forEach((item) => {
        let coordsArray;
        console.log("zoom: ", map.getZoom());
        console.log("stroke: ", strokeWeight);
        // Validate and parse nearbyGeoCoords
        try {
          coordsArray = JSON.parse(item.nearbyGeoCoords);
        } catch (error) {
          return; // Skip if parsing fails
        }

        const completePath = [
          ...coordsArray.map(coord => [coord.lat, coord.lng]), 
          ...coordsArray.slice().reverse().map(coord => [coord.lat, coord.lng])
        ];
        let colorData = colors[item.deviceID];

        // Convert color data to an object if it's a string
        if (typeof colorData === "string") {
          try {
            const formattedColorData = colorData.replace(/'/g, '"').trim();
            colorData = JSON.parse(formattedColorData);
          } catch (error) {
            console.error("Error parsing color data:", colorData, error);
            return;
          }
        }

        // Check if color is valid and create the polygon
        if (colorData && typeof colorData === "object" && "r" in colorData && "g" in colorData && "b" in colorData && "a" in colorData) {
          const color = rgba2hex(colorData);

          const polygon = new Polygon(completePath, {
            color,
            weight: strokeWeight,
            fillColor: color,
            fillOpacity: 0.4,
          });

          polygon.addTo(map);
          polygonsRef.current.push(polygon);
        }
      });
    }
  }, [map, coordinates, zoomLevel, colors]);

  useEffect(() => {
    return () => {
      polygonsRef.current.forEach((polygon) => {
        map.removeLayer(polygon);
      });
      polygonsRef.current = [];
    };
  }, [map]);

  function rgba2hex(color) {
    const toHex = (value) => Math.round(value).toString(16).padStart(2, "0");
    const redHex = toHex(color.r);
    const greenHex = toHex(color.g);
    const blueHex = toHex(color.b);
    const alphaHex = toHex((color.a / 100) * 255);
    return `#${redHex}${greenHex}${blueHex}${alphaHex}`;
  }

  return null;
};

export default LeafletPolygonOverlay;
