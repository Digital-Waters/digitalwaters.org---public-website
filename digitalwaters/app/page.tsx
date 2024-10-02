"use client"

import MapContainer from '../app/components/map/MapContainer';

const Home: React.FC = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#5b73a5]">
      <MapContainer />
    </div>
  );
};

export default Home;
