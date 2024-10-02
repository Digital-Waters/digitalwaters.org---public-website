"use client"

import { useEffect, useRef, useState } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

interface PolygonOverlayProps {
  coordinates: google.maps.LatLngLiteral[][];
}

const PolygonOverlay: React.FC<PolygonOverlayProps> = ({ coordinates }) => {
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

      if (polygonsRef.current.length === 0) {
        coordinates.forEach((items) => {
          const completePath = [...items, ...items.slice().reverse()];
          const polygon = new window.google.maps.Polygon({
            paths: completePath,
            strokeColor: '#48493F',
            strokeOpacity: 1.0,
            strokeWeight,
            fillColor: '#48493F',
            fillOpacity: 0.1,
          });

          polygon.setMap(map);
          polygonsRef.current.push(polygon);
        });
      } else {
        polygonsRef.current.forEach((polygon) => {
          polygon.setOptions({ strokeWeight });
        });
      }
    }
  }, [map, coordinates, zoomLevel]);

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
