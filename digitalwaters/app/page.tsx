"use client";

import dynamic from 'next/dynamic';

// Dynamically import components without SSR
const LeafletMapContainer = dynamic(() => import('./LeafletMapContainer'), { ssr: false });
const Slider = dynamic(() => import('./Slider'), { ssr: false });

const Home: React.FC = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#15171a] flex-col">
      <div className="py-5 w-2/3">
        <Slider />
      </div>
      <LeafletMapContainer />
    </div>
  );
};

export default Home;
