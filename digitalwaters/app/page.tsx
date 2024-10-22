"use client"

import MapContainer from '../app/components/map/MapContainer';
import Slider from '../app/components/map/Slider'

const Home: React.FC = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#5b73a5] flex-col">
      <MapContainer />
      <div className=" pt-5 w-2/3">
        <Slider/>
      </div>
    </div>
  );
};

export default Home;
