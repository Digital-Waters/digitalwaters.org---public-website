"use client";
import { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap } from '@vis.gl/react-google-maps';

const PolygonOverlay = ({ coordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      coordinates.map((items, index) => {
        // Append the reversed coordinates to trace back through the same points
        const completePath = [...items, ...items.slice().reverse()];

        const polygon = new window.google.maps.Polygon({
          paths: completePath,
          strokeColor: '#FF0000', // Red stroke color
          strokeOpacity: 1.0,     // Fully opaque stroke
          strokeWeight: 3,        // Thicker stroke weight for visibility
          fillColor: '#FF0000',   // Red fill color
          fillOpacity: 0.1,       // Semi-opaque fill
        });
  
        polygon.setMap(map);
        
        return () => {
          polygon.setMap(null);
        };
      });
    }
  }, [map, coordinates]);

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
        const res = await fetch('/data/output.json'); // Adjust to match your file type
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
