"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { Building2, Search, Filter, Home, DollarSign, Maximize, MapPin } from "lucide-react";

export default function PropertiesBrowse() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [category, setCategory] = useState("");
  const [listingType, setListingType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    fetchProperties();
  }, [category, listingType, minPrice, maxPrice]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (category) query.append("category", category);
      if (listingType) query.append("listingType", listingType);
      if (minPrice) query.append("minPrice", minPrice);
      if (maxPrice) query.append("maxPrice", maxPrice);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8085"}/api/property/search?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProperties(data.content || []); // Assuming Page<Property>
      }
    } catch (error) {
      console.error("Failed to fetch properties", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-20">
      
      {/* Header & Filters */}
      <header className="bg-white border-b border-gray-200 px-6 py-8 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Building2 className="w-10 h-10 text-brand" />
            Discover Properties
          </h1>
          <p className="mt-2 text-lg text-gray-600">Find the perfect commercial or residential space near high-demand areas.</p>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <select className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand outline-none" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="RESIDENTIAL">Residential</option>
              <option value="LAND">Land</option>
            </select>
            
            <select className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand outline-none" value={listingType} onChange={e => setListingType(e.target.value)}>
              <option value="">All Listing Types</option>
              <option value="RENT">For Rent</option>
              <option value="SELL">For Sale</option>
              <option value="LEASE">For Lease</option>
            </select>

            <div className="relative">
              <DollarSign className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input type="number" placeholder="Min Price" className="w-full pl-10 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand outline-none" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
            </div>

            <div className="relative">
              <DollarSign className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input type="number" placeholder="Max Price" className="w-full pl-10 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand outline-none" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content: Map + List Split View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left: Scrollable List */}
        <div className="lg:col-span-2 flex flex-col gap-6 overflow-y-auto pr-2 pb-20" style={{ maxHeight: "calc(100vh - 280px)" }}>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
            </div>
          ) : properties.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">No properties found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your filters to see more results.</p>
            </div>
          ) : (
            properties.map((prop, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={prop.id} 
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer"
              >
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  <img src={prop.images?.length ? prop.images[0] : "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-gray-900 shadow-sm">
                    {prop.listingType}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{prop.title}</h3>
                    <p className="text-xl font-black text-brand">${prop.price}</p>
                  </div>
                  <p className="text-gray-500 flex items-center gap-1.5 text-sm mb-4">
                    <MapPin className="w-4 h-4" /> {prop.address || "Location unavailable"}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Home className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium">{prop.category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Maximize className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium">{prop.areaSqft} sqft</span>
                    </div>
                  </div>
                  
                  {prop.nearbyDemandCount > 0 && (
                     <div className="mt-4 bg-orange-50 text-orange-700 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
                       🔥 High Demand Area: {prop.nearbyDemandCount} community requests nearby
                     </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Right: Map View */}
        <div className="lg:col-span-3 bg-gray-200 rounded-3xl overflow-hidden shadow-inner border border-gray-200 relative min-h-[500px]">
          <Map
            defaultZoom={12}
            defaultCenter={{ lat: 37.7749, lng: -122.4194 }}
            mapId="DEMAND_MAP_ID"
            disableDefaultUI={true}
          >
            {properties.map(prop => {
              if (!prop.location?.y || !prop.location?.x) return null;
              return (
                <AdvancedMarker key={prop.id} position={{ lat: prop.location.y, lng: prop.location.x }}>
                  <Pin background={"#c6613f"} borderColor={"#fff"} glyphColor={"#fff"} />
                </AdvancedMarker>
              );
            })}
          </Map>
        </div>
      </main>
    </div>
  );
}
