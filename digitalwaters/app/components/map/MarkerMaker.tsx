"use client"

import { AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

interface Marker {
  latitude: number;
  longitude: number;
  imageUrl: string;
  time: string;
}

interface MarkerListProps {
  markers: string[][];
  onClick: (marker: Marker) => void;
}

const MarkerMaker: React.FC<MarkerListProps> = ({ markers, onClick }) => {
  return (
    <>
      {markers.map((item, index) => {
        const latitude = parseFloat(item[2]);
        const longitude = parseFloat(item[3]);
        const imageUrl = item[5];
        const time = item[4];

        return (
          <AdvancedMarker
            key={index}
            position={{ lat: latitude, lng: longitude }}
            onClick={() => onClick({ latitude, longitude, imageUrl, time })}
          >
            <Pin background={"purple"} borderColor={"green"} glyphColor={"red"} scale={0.75} /> 
          </AdvancedMarker>
        );
      })}
    </>
  );
};

export default MarkerMaker;
