// LeafletMapContainer.js
"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import  { Icon, LatLngExpression  } from "leaflet";
import LeafletPolygonOverlay from './PolygonOverlay'

// Use relative paths to the public folder for images
const markerIcon = "/assets/pin.png";

// Define the default icon with the correct path
const DefaultIcon = new Icon({
  iconUrl: markerIcon,
  iconSize: [25, 25],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function LeafletMapContainer() {
  const position: LatLngExpression = [43.687104, -79.39095966666666]; // Type the position correctly
  const [waterBodyCoordinates, setWaterBodyCoordinates] = useState([]);
  const [userData, setUserData] = useState(null);
  const [uniqueDevices, setUniqueDevices] = useState([]);
  const [colors, setColors] = useState({});

  const dateParam = new URLSearchParams(window.location.search).get("date");
  const timeParam = new URLSearchParams(window.location.search).get("time");

  useEffect(() => {
    async function fetchPolygonData() {
      try {
        const res = await fetch(process.env.NEXT_PUBLIC_WATER_DEVICE_URL);
        const data = await res.json();
        console.log(data);
        setWaterBodyCoordinates(data);
      } catch (error) {
        console.error("Error loading polygon data:", error);
      }
    }
    if (uniqueDevices) fetchPolygonData();
  }, [uniqueDevices]);

  useEffect(() => {
    async function fetchData() {
      if (!dateParam) return;
      try {
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_WATER_DATA_URL
          }?only_underwater=25&begin_datetime=${
            dateParam + "T00:00:00-05:00"
          }&end_datetime=${dateParam + "T23:59:59-05:00"}`
        );
        const data = await res.json();

        const organizedData = data.reduce((acc, item) => {
          const { deviceID } = item;
          if (!acc[deviceID]) acc[deviceID] = [];
          acc[deviceID].push(item);
          return acc;
        }, {});

        setUserData(organizedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, [dateParam]);

  useEffect(() => {
    if (userData) {
      setUniqueDevices(Array.from(new Set(Object.keys(userData))));
    }
  }, [userData]);

  useEffect(() => {
    if (dateParam && timeParam && userData) {
      const updatedColors = {};
      const targetTime = new Date(`${dateParam}T${timeParam}`);
      const startTime = new Date(targetTime.getTime() - 10 * 60 * 1000);

      Object.keys(userData).forEach((deviceID) => {
        const deviceEntries = userData[deviceID];
        const closestEntry = deviceEntries.find((entry) => {
          const entryTime = new Date(entry.device_datetime);
          return (
            entryTime >= startTime &&
            entryTime <= targetTime &&
            isValidColor(entry.waterColor)
          );
        });

        if (closestEntry) updatedColors[deviceID] = closestEntry.waterColor;
        else updatedColors[deviceID] = "{'r': 0, 'g': 0, 'b': 0, 'a': 0}";
      });

      setColors(updatedColors);
    }
  }, [dateParam, timeParam, userData]);

  function isValidColor(colorString) {
    try {
      const colorObject = JSON.parse(colorString.replace(/'/g, '"'));
      return ["r", "g", "b", "a"].every(
        (key) => key in colorObject && !isNaN(colorObject[key])
      );
    } catch  {
      return false;
    }
  }

  return (
    <MapContainer center={position} zoom={12} className="h-4/5 w-3/4">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {userData &&
        Object.keys(userData).map((deviceID) =>
          userData[deviceID].map((item, index) => {
            const latitude = parseFloat(item["latitude"]);
            const longitude = parseFloat(item["longitude"]);
            const time = item["device_datetime"];

            if (latitude !== 999 && longitude !== 999) {
              return (
                <Marker
                  key={`${deviceID}-${index}`}
                  position={[latitude, longitude]}
                  icon={DefaultIcon}
                >
                  <Popup>{time}</Popup>
                </Marker>
              );
            } else {
              return null;
            }
          })
        )}
        <LeafletPolygonOverlay coordinates={waterBodyCoordinates} colors={colors}/>
    </MapContainer>
  );
}

export default LeafletMapContainer;
