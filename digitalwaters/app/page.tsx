"use client"

import MapContainer from '../app/components/map/MapContainer';
import Slider from '../app/components/map/Slider';
//import LeafletMap from '../app/components/map/LeafletMap'


const Home: React.FC = () => {
  return (
      <div className="h-screen w-full flex items-center justify-center bg-[#15171a] flex-col">
        <div className=" py-5 w-2/3">
          <Slider />
        </div>
          <MapContainer />
          {/*<LeafletMap/>*/}
      </div>
  );
};

export default Home;
