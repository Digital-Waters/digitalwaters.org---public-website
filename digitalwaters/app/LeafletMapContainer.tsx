// LeafletMapContainer.js
"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import  { Icon, LatLngExpression  } from "leaflet";
import LeafletPolygonOverlay from './PolygonOverlay';
import { useSelector } from "react-redux";
import { RootState } from "../lib/store.ts";

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

  const organizedData = useSelector((state: RootState) => state.waterData.organizedData);
  const currentData = useSelector((state: RootState) => state.waterData.currentData);
  const waterBodyCoordinates = useSelector((state: RootState) => state.waterData.waterBodyCoordinates);

  //console.log("Organized Data:", organizedData);
  //console.log("Current Data:", currentData);
  //console.log("Water Body Coordinates:", waterBodyCoordinates);

  return (
    <MapContainer center={position} zoom={15} className="h-4/5 w-3/4 z-0" >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {organizedData &&
        Object.keys(organizedData).map((deviceID) =>
          organizedData[deviceID].map((item, index) => {
            const latitude = parseFloat(item["latitude"]);
            const longitude = parseFloat(item["longitude"]);
            const time = item["device_datetime"];
            const deviceID = item["deviceID"];

            if (latitude !== 999 && longitude !== 999) {
              return (
                <Marker
                  key={`${deviceID}-${index}`}
                  position={[latitude, longitude]}
                  icon={DefaultIcon}
                >
                  <Popup>{deviceID}</Popup>
                </Marker>
              );
            } else {
              return null;
            }
          })
        )}
        <LeafletPolygonOverlay/>
    </MapContainer>
  );
}

export default LeafletMapContainer;
