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
        const res = await fetch(`https://water-watch-58265eebffd9.herokuapp.com/getwaterdevice/`);
        const data = await res.json();
        console.log(data);
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
        console.log('Starting fetch operation...');
  
        const res = await fetch('https://water-watch-58265eebffd9.herokuapp.com/getwaterdata/?max_temperature=14');
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
  
        const data = await res.json(); 
        console.log('Data received:', data); // Log the data for visibility
  
        const organizedData = data.reduce((acc, item) => {
          const { deviceID } = item;
          if (!acc[deviceID]) {
            acc[deviceID] = [];
          }
          acc[deviceID].push(item);
          return acc;
        }, {});
        console.log("organized Data: ", organizedData);
        
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
      const updatedColors = {}; // Create a new object to batch updates
  
      Object.keys(userData).forEach((deviceID) => {
        const deviceEntries = userData[deviceID];
  
        // Check if dateParam is less than the date of the last element in the array
        const lastDeviceDate = deviceEntries[deviceEntries.length - 1]["device_datetime"].split('T')[0];
        if (dateParam < lastDeviceDate) {
          updatedColors[deviceID] = "{'r': 0, 'g': 0, 'b': 0, 'a': 0}";
          return;
        }
        const latestDeviceDate = deviceEntries[0]["device_datetime"].split('T')[0];

        if (dateParam >= latestDeviceDate){
          updatedColors[deviceID] = deviceEntries[0]["waterColor"]
          return;
        }
  
        // Find the first valid entry with a device date <= dateParam
        const validEntry = deviceEntries.find((deviceData) => {
          const deviceDate = deviceData["device_datetime"].split('T')[0];
          return deviceDate <= dateParam && isValidColor(deviceData["waterColor"]);
        });
  
        if (validEntry) {
          updatedColors[deviceID] = validEntry["waterColor"];
        } else {
          // If no valid entry found, set color to 'rgba(0, 0, 0, 0)' as a fallback
          updatedColors[deviceID] = "{'r': 0, 'g': 0, 'b': 0, 'a': 0}";
        }
      });
      console.log(updatedColors);
      setColors((prevState) => ({ ...prevState, ...updatedColors })); // Update state in one go
    }
  }, [dateParam, userData]);
  
  
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}>
      <div className="h-4/5 w-4/6 rounded-lg overflow-hidden pb-8">
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
