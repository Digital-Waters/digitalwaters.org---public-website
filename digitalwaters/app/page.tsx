"use client";
import { useState, useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap } from '@vis.gl/react-google-maps';

const PolygonOverlay = ({ coordinates }) => {
  const map = useMap();
  const [zoomLevel, setZoomLevel] = useState(null); // Track zoom level
  const polygonsRef = useRef([]); // Store polygon references

  useEffect(() => {
    if (map) {
      // Event listener for zoom changes
      const handleZoomChange = () => {
        const zoom = map.getZoom();
        setZoomLevel(zoom); // Update zoom level
      };

      // Add zoom change listener
      const zoomListener = window.google.maps.event.addListener(map, 'zoom_changed', handleZoomChange);

      // Set initial zoom level
      setZoomLevel(map.getZoom());

      // Clean up listener on unmount
      return () => {
        window.google.maps.event.removeListener(zoomListener);
      };
    }
  }, [map]);

  useEffect(() => {
    if (map && coordinates.length > 0 && zoomLevel !== null) {
      // Define stroke weight based on zoom level
      const strokeWeight = zoomLevel > 15 ? 15 : zoomLevel <= 15 && zoomLevel > 10 ? 5 : 1;

      // If polygons haven't been created yet, create them and store the references
      if (polygonsRef.current.length === 0) {
        coordinates.forEach((items) => {
          const completePath = [...items, ...items.slice().reverse()];
          const polygon = new window.google.maps.Polygon({
            paths: completePath,
            strokeColor: '#48493F',
            strokeOpacity: 1.0,
            strokeWeight: strokeWeight, // Initial stroke weight
            fillColor: '#48493F',
            fillOpacity: 0.1,
          });

          polygon.setMap(map); // Set polygon on the map
          polygonsRef.current.push(polygon); // Store polygon reference
        });
      } else {
        // Update stroke weight of existing polygons
        polygonsRef.current.forEach((polygon) => {
          polygon.setOptions({ strokeWeight });
        });
      }
    }
  }, [map, coordinates, zoomLevel]); // Re-run effect only when zoomLevel changes

  // Clean up polygons when component unmounts
  useEffect(() => {
    return () => {
      polygonsRef.current.forEach((polygon) => {
        polygon.setMap(null); // Remove polygon from map
      });
      polygonsRef.current = []; // Clear polygon references
    };
  }, []);

  return null;
};




export default function Home() {
  const position = { lat: 43.687104, lng: -79.39095966666666 };
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [waterBodyCoordinates, setWaterBodyCoordinates] = useState([]); // Store polygon coordinates
  const [selectedPin, setSelectedPin] = useState(null);


  useEffect(() => {
    async function fetchPolygonData() {
      try {
        const res = await fetch('/data/rivers.json'); // Adjust to match your file type
        const data = await res.json(); // Or text for .js file
        setWaterBodyCoordinates(data.waterBodyCoordinates); // Ensure this contains the coordinates
      } catch (error) {
        console.error("Error loading polygon data:", error);
      }
    }
    fetchPolygonData();
  }, []);
  

  // Simulate fetching pins or user data
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/data/data.json'); // Example JSON data
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await res.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#5b73a5]">
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
        <div className="h-4/5 w-4/6 rounded-lg overflow-hidden">
          <Map
            defaultCenter={position}
            defaultZoom={12}
            mapId={process.env.NEXT_PUBLIC_MAP_ID}
            options={{
              zoomControl: true,
              scrollwheel: true,
              draggable: true,
              disableDoubleClickZoom: false,
            }}
          >
            {userData && userData.values.map((item, index) => {
              const latitude = parseFloat(item[2]);
              const longitude = parseFloat(item[3]);
              const imageUrl = item[5];
              const time = item[4];

              return (
                <AdvancedMarker
                  key={index}
                  position={{ lat: latitude, lng: longitude }}
                  onClick={() => {
                    setSelectedPin({ latitude, longitude, imageUrl, time });
                    setOpen(true);
                  }}
                >
                  <Pin background={"purple"} borderColor={"green"} glyphColor={"red"} scale={0.75} />
                </AdvancedMarker>
              );
            })}
            {open && selectedPin &&
              <InfoWindow
                position={{ lat: selectedPin.latitude, lng: selectedPin.longitude }}
                onClose={() => { setOpen(false); }}
                scale={0.75}
              >
                <div className="flex flex-col items-center h-full w-full">
                  <div className="w-full">
                    <p className="text-lg text-center">Time: {selectedPin.time}</p>
                  </div>
                  <img
                    src={selectedPin.imageUrl}
                    alt="Weather related"
                    className="w-40 max-w-xs object-contain mt-2"
                  />
                </div>
              </InfoWindow>
            }
            {waterBodyCoordinates &&             
              <PolygonOverlay coordinates={waterBodyCoordinates} />
          }
          </Map>
        </div>
      </APIProvider>
    </div>
  );
}
