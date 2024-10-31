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
  const [uniqueDevices, setUniqueDevices] = useState<string[]>([]);
  const [colors, setColors] = useState({});
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');
  const timeParam = searchParams.get('time');

  


  const handleMarkerClick = (pin: PinData) => {
    setSelectedPin(pin);
    setOpen(true);
  };

  useEffect(() => {
    async function fetchPolygonData() {
      try {
        const res = await fetch(`https://water-watch-58265eebffd9.herokuapp.com/getwaterdevice/`);
        const data = await res.json();
        console.log("polygon: ", data);
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
      if (!dateParam) return;
      try {
        console.log('Starting fetch operation...');
        const res = await fetch(`https://water-watch-58265eebffd9.herokuapp.com/getwaterdata/?only_underwater=25&begin_datetime=${dateParam+'T00:00:00-05:00'}&end_datetime=${dateParam+'T23:59:59-05:00'}`);
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
  }, [dateParam]);
  

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
    if (dateParam && timeParam && userData) {
      const updatedColors = {};
  
      const targetTime = new Date(`${dateParam}T${timeParam}`);
      const startTime = new Date(targetTime.getTime() - 10 * 60 * 1000); // 10 minutes before
  
      Object.keys(userData).forEach((deviceID) => {
        const deviceEntries = userData[deviceID];
  
        // Find the first entry within the 10-minute window (closest due to descending order)
        const closestEntry = deviceEntries.find((entry) => {
          const entryTime = new Date(entry.device_datetime);
          return entryTime >= startTime && entryTime <= targetTime && isValidColor(entry.waterColor);
        });
  
        if (closestEntry) {
          console.log("Closest device dateTime:", closestEntry.device_datetime);
          updatedColors[deviceID] = closestEntry.waterColor;
        } else {
          // Fallback color if no valid entry is found
          updatedColors[deviceID] = "{'r': 0, 'g': 0, 'b': 0, 'a': 0}";
        }
      });
  
      console.log(updatedColors);
      setColors((prevState) => ({ ...prevState, ...updatedColors }));
    }
  }, [dateParam, timeParam, userData]);
  
  
  
  
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
