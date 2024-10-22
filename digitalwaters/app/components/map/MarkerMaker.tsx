"use client";

import { AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

interface Marker {
  latitude: number;
  longitude: number;
  imageUrl: string;
  time: string;
}

interface MarkerListProps {
  markers: any;
  onClick: (marker: Marker) => void;
}

const MarkerMaker: React.FC<MarkerListProps> = ({ markers, onClick }) => {

  return (
    <>
    { Object.keys(markers).map((deviceID) => (
      markers[deviceID].map((item, index) => {
        const latitude = parseFloat(item["latitude"]);
        const longitude = parseFloat(item["longitude"]);
        const imageUrl = item["imageURI"];
        const time = item["device_datetime"];

        // Check if latitude and longitude are valid numbers
        if (latitude !== 999 && longitude !== 999) {
          return (
            <AdvancedMarker
              key={`${deviceID}-${index}`}
              position={{ lat: latitude, lng: longitude }}
              onClick={() => onClick({ latitude, longitude, imageUrl, time})}
            >
              <Pin background={"purple"} borderColor={"green"} glyphColor={"red"} scale={0.75} />
            </AdvancedMarker>
          );
        } else {
          return null;
        }
      })
))}
      
    </>
  );
};

export default MarkerMaker;
