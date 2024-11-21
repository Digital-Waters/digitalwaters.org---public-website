"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import {
  setOrganizedData,
  setCurrentData,
  setWaterBodyCoordinates,
  setDateLimit
} from "../lib/features/waterData/waterDataSlice";

// Dynamically import components without SSR
const LeafletMapContainer = dynamic(() => import("./LeafletMapContainer"), {
  ssr: false,
});
const Slider = dynamic(() => import("./Slider"), { ssr: false });
const Layers = dynamic(() => import("./Layers"), { ssr: false });

const Home: React.FC = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  const timeParam = searchParams.get("time");
  let organizedData = null;

  const [prevDate, setPrevDate] = useState<string | null>(null);

  // Fetch Water Body Coordinates
  const fetchPolygonData = async () => {
    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_WATER_DEVICE_URL as string
      );
      const data = await res.json();
      dispatch(setWaterBodyCoordinates(data));
    } catch (error) {
      console.error("Error loading polygon data:", error);
    }
  };

  // Fetch User Data and Organize
  const fetchUserData = async () => {
    if (!dateParam) return {};
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_WATER_DATA_URL}?only_underwater=25&limit=3000&deviceIDs=0000000077de649d&deviceIDs=000000002133dded&sort_by=deviceDatetime`
      );
      const data = await res.json();

      const globalEarliestDate = data[0].device_datetime;
      const globalLatestDate = data[data.length-1].device_datetime;

      const organizedData = data.reduce(
        (acc: Record<string, any[]>, item: any) => {
          const { deviceID } = item;
          if (!acc[deviceID]) acc[deviceID] = [];
          acc[deviceID].push(item);
          return acc;
        },
        {}
      );
      console.log(organizedData);

      dispatch(setOrganizedData(organizedData));
      dispatch(setDateLimit([globalEarliestDate, globalLatestDate]));
      return organizedData;
    } catch (error) {
      console.error("Error fetching data:", error);
      return {};
    }
  };

  // Set Current Data Based on Time
  const updateCurrentData = (organizedData: Record<string, any>) => {
    if (dateParam && timeParam && organizedData) {
      const updatedDeviceData: Record<string, any> = {};
      const targetTime = new Date(`${dateParam}T${timeParam}`);
      const startTime = new Date(targetTime.getTime() - 10 * 60 * 1000);

      Object.keys(organizedData).forEach((deviceID) => {
        const deviceEntries = organizedData[deviceID];
        const closestEntry = deviceEntries.find((entry) => {
          const entryTime = new Date(entry.device_datetime);
          return (
            entryTime >= startTime &&
            entryTime <= targetTime &&
            isValidColor(entry.waterColor)
          );
        });

        updatedDeviceData[deviceID] = closestEntry || {
          deviceID,
          latitude: 0,
          longitude: 0,
          device_datetime: `${dateParam}T${timeParam}`,
          imageURI: "",
          weather: "",
          waterColor: "{'r': 0, 'g': 0, 'b': 0, 'a': 0}",
        };
      });
      dispatch(setCurrentData(updatedDeviceData));
    }
  };

  function isValidColor(colorString: string) {
    try {
      const colorObject = JSON.parse(colorString.replace(/'/g, '"'));
      return ["r", "g", "b", "a"].every(
        (key) => key in colorObject && !isNaN(colorObject[key])
      );
    } catch {
      return false;
    }
  }

  // Fetch and Dispatch Data on Initial Mount
  useEffect(() => {
    const fetchData = async () => {
      await fetchPolygonData();
    };
    fetchData();
  }, [dispatch]);

  // Fetch User Data when `dateParam` changes
  useEffect(() => {
    const fetchData = async () => {
      if (dateParam && dateParam !== prevDate && organizedData == null) {
        organizedData = await fetchUserData();
        setPrevDate(dateParam); // Update previous date
      }
      updateCurrentData(organizedData);
    };
    fetchData();
  }, [dateParam, timeParam]);

  // Update Current Data when `timeParam` changes
  useEffect(() => {
    const organizedData = fetchUserData(); // Use the previously fetched data
    organizedData.then((data) => updateCurrentData(data));
  }, [timeParam]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#15171a] relative">
      <div className="py-5 w-2/3">
        <Slider />
        <Layers />
      </div>
      <LeafletMapContainer />
    </div>
  );
};

export default Home;
