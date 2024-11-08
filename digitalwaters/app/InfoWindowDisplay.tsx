"use client";

import { InfoWindow } from '@vis.gl/react-google-maps';
import Image from 'next/image';

interface SelectedPin {
  latitude: number;
  longitude: number;
  imageUrl: string;
  time: string;
}

interface InfoWindowDisplayProps {
  selectedPin: SelectedPin | null;
  open: boolean;
  onClose: () => void;
}

const InfoWindowDisplay: React.FC<InfoWindowDisplayProps> = ({ selectedPin, open, onClose }) => {
  if (!open || !selectedPin) return null;

  return (
    <InfoWindow
      position={{ lat: selectedPin.latitude, lng: selectedPin.longitude }}
      onClose={onClose}
    >
      <div className="flex flex-col items-center h-full w-full">
        <div className="w-full">
          <p className="text-lg text-center text-black">Time: {selectedPin.time}</p>
        </div>
        <Image
          src={selectedPin.imageUrl}
          alt="Weather related"
          className="w-40 max-w-xs object-contain mt-2"
        />
      </div>
    </InfoWindow>
  );
};

export default InfoWindowDisplay;
