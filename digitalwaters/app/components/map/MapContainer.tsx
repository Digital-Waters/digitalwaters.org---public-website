"use client"

import { useEffect, useState } from 'react';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import PolygonOverlay from './PolygonOverlay';
import MarkerMaker from './MarkerMaker';
import InfoWindowDisplay from './InfoWindowDisplay';
import {useSearchParams} from 'next/navigation';

interface DataPoint {
  latitude: number;
  longitude: number;
  imageUrl: string;
  time: string;
}

const MapContainer: React.FC = () => {
  const position = { lat: 43.687104, lng: -79.39095966666666 };
  const [open, setOpen] = useState<boolean>(false);
  const [selectedPin, setSelectedPin] = useState<DataPoint | null>(null);
  const [waterBodyCoordinates, setWaterBodyCoordinates] = useState<google.maps.LatLngLiteral[][]>([]);
  const [userData, setUserData] = useState<{ values: string[][] } | null>(null);
  const [uniqueDevices, setUniqueDevices] = useState<string[]>(null);
  const [colors, setColors] = useState({});
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');
  


  const handleMarkerClick = (pin: PinData) => {
    setSelectedPin(pin);
    setOpen(true);
  };

  useEffect(() => {
    async function fetchPolygonData() {
      try {
        const res = await fetch(`http://localhost:3000/api/waterways/${uniqueDevices}`);
        const data = await res.json();
        setWaterBodyCoordinates(data);
      } catch (error) {
        console.error("Error loading polygon data:", error);
      }
    }
    if (uniqueDevices){
      fetchPolygonData();
    }
  }, [uniqueDevices]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/data/data.json');
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await res.json(); 
        const organizedData = data.reduce((acc, item) => {
          const { deviceID } = item;
          if (!acc[deviceID]) {
            acc[deviceID] = [];
          }
          acc[deviceID].push(item);
          return acc;
        }, {});
        
  
        setUserData(organizedData); // Save organized data
      } catch (error) {
        console.error("Error fetching data:", error);
      } 
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (userData) {
      const unique = Array.from(new Set(Object.keys(userData)));
      setUniqueDevices(unique);
    }
  }, [userData]);

  function isValidColor(colorString) {
    try {
      // Convert the string into an object
      const colorObject = JSON.parse(colorString.replace(/'/g, '"'));
  
      // Check if all required keys are present and valid numbers
      return ['r', 'g', 'b', 'a'].every(key => key in colorObject && !isNaN(colorObject[key]));
    } catch (error) {
      // If parsing fails, the color is invalid
      return false;
    }
  }
  

  useEffect(() => {
    if (dateParam && userData) {
        Object.keys(userData).map((deviceID) => {
          let found = false;
            for (let i = userData[deviceID].length - 1; i >= 0; i--) {
                const deviceData = userData[deviceID][i];
                const deviceDate = deviceData["device_datetime"].split('T')[0];
                // Check if the device date is less than or equal to the dateParam
                if (deviceDate <= dateParam) {
                    const waterColor = deviceData["waterColor"];
                    if (isValidColor(waterColor)) {
                      setColors(prevState => ({
                        ...prevState,
                        [deviceData["deviceID"]]: waterColor // Update or add the specific key-value pair
                      }));
                      found = true;
                      break;
                    }
                }
            }

          
        });
    }
}, [dateParam, userData]);


  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}>
      <div className="h-4/5 w-4/6 rounded-lg overflow-hidden">
        <Map
          defaultCenter={position}
          defaultZoom={12}
          mapId={process.env.NEXT_PUBLIC_MAP_ID as string}
          options={{
            zoomControl: true,
            scrollwheel: true,
            draggable: true,
            disableDoubleClickZoom: false,
          }}
        >
          {userData && (
            <MarkerMaker markers={userData} onClick={handleMarkerClick} />
          )}
          <InfoWindowDisplay
            selectedPin={selectedPin}
            open={open}
            onClose={() => setOpen(false)}
          />
          <PolygonOverlay coordinates={waterBodyCoordinates} colors={colors}/>
        </Map>
      </div>
    </APIProvider>
  );
};

export default MapContainer;
