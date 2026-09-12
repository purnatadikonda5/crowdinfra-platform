"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  APIProvider,
  ControlPosition,
  MapControl,
  AdvancedMarker,
  Map,
  useMap,
  useMapsLibrary,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import { useUserContext } from "./user_context";

const PlaceAutocomplete = () => {
  const { setSelectedPlace } = useUserContext();
  const [placeAutocomplete, setPlaceAutocomplete] = useState(null);
  const inputRef = useRef(null);
  const places = useMapsLibrary("places"); // Now works because of APIProvider in Home.js

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ["geometry", "name", "formatted_address"],
    };

    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;

    placeAutocomplete.addListener("place_changed", () => {
      setSelectedPlace(placeAutocomplete.getPlace());
    });
  }, [setSelectedPlace, placeAutocomplete]);

  return (
    <input
      ref={inputRef}
      className="w-full px-4 py-2 text-white border font-mono bg-white/5 rounded-lg focus:outline-none focus:border-blue-500"
      placeholder="Search for a place..."
    />
  );
};

export default PlaceAutocomplete;
