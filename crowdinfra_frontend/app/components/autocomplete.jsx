"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useUserContext } from "./user_context";

const PlaceAutocomplete = ({ placeholder = "Search for a place..." }) => {
  const { setSelectedPlace } = useUserContext();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  const fetchSuggestions = useCallback(async (q) => {
    if (!q || q.length < 2) { setSuggestions([]); return; }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&countrycodes=in`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      setSuggestions(data);
      setOpen(true);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 350);
  };

  const handleSelect = (item) => {
    setQuery(item.display_name);
    setSuggestions([]);
    setOpen(false);
    setSelectedPlace({ lat: parseFloat(item.lat), lng: parseFloat(item.lon) });
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={wrapperRef} style={{ position: "relative", width: "100%" }}>
      <input
        value={query}
        onChange={handleChange}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        className="w-full px-4 py-2 text-white border font-mono bg-white/5 rounded-lg focus:outline-none focus:border-amber-500"
        placeholder={placeholder}
        autoComplete="off"
      />
      {loading && (
        <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>
          <div style={{ width: 16, height: 16, border: "2px solid #f59e0b", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}
      {open && suggestions.length > 0 && (
        <ul style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 9999,
          background: "#1a1200", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12,
          overflow: "hidden", listStyle: "none", margin: 0, padding: 0,
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)"
        }}>
          {suggestions.map((s) => (
            <li
              key={s.place_id}
              onClick={() => handleSelect(s)}
              style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "#e5e7eb", fontSize: 13, lineHeight: 1.4 }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(245,158,11,0.1)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ color: "#fbbf24", marginRight: 6 }}>📍</span>
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlaceAutocomplete;
