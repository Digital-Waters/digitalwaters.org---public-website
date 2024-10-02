"use client"

import { useEffect, useState } from 'react';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import PolygonOverlay from './PolygonOverlay';
import MarkerMaker from './MarkerMaker';
import InfoWindowDisplay from './InfoWindowDisplay';

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

  const handleMarkerClick = (pin: PinData) => {
    setSelectedPin(pin);
    setOpen(true);
  };

  useEffect(() => {
    async function fetchPolygonData() {
      try {
        const res = await fetch('/data/rivers.json');
        const data = await res.json();
        setWaterBodyCoordinates(data.waterBodyCoordinates);
      } catch (error) {
        console.error("Error loading polygon data:", error);
      }
    }
    fetchPolygonData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/data/data.json');
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
            <MarkerMaker markers={userData.values} onClick={handleMarkerClick} />
          )}
          <InfoWindowDisplay
            selectedPin={selectedPin}
            open={open}
            onClose={() => setOpen(false)}
          />
          <PolygonOverlay coordinates={waterBodyCoordinates} />
        </Map>
      </div>
    </APIProvider>
  );
};

export default MapContainer;
