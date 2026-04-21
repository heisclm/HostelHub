'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useHostelsPaginated } from '@/hooks/useHostels';
import { Hostel, Room } from '@/types';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Filter, BedDouble, Heart, Star, Map, LayoutGrid, ArrowRight, Loader2 } from 'lucide-react';
import Image from 'next/image';

type HostelWithRooms = Hostel & { rooms: Room[] };

export default function HostelsPage() {
  const { hostels, isLoading, hasMore, loadHostels, initialLoaded } = useHostelsPaginated(12);

  // Load initial data
  useEffect(() => {
    if (!initialLoaded) {
      loadHostels(true);
    }
  }, [initialLoaded, loadHostels]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [maxPrice, setMaxPrice] = useState('');
  const [roomTypeFilter, setRoomTypeFilter] = useState('all');

  const filteredHostels = useMemo(() => {
    if (!hostels) return [];
    
    let result = hostels as HostelWithRooms[];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(h => 
        h.name.toLowerCase().includes(q) || 
        h.location.toLowerCase().includes(q) ||
        h.address.toLowerCase().includes(q)
      );
    }

    if (locationFilter !== 'all') {
      result = result.filter(h => h.location.toLowerCase().includes(locationFilter.toLowerCase()));
    }

    if (maxPrice) {
      const max = Number(maxPrice);
      result = result.filter(h => h.rooms.some(r => r.pricePerSemester <= max));
    }

    if (roomTypeFilter !== 'all') {
      result = result.filter(h => h.rooms.some(r => r.type === roomTypeFilter));
    }

    return result;
  }, [searchQuery, locationFilter, maxPrice, roomTypeFilter, hostels]);

  // Extract unique locations for the filter dropdown
  const uniqueLocations = useMemo(() => Array.from(new Set(hostels.map(h => h.location))), [hostels]);

  const getStartingPrice = (rooms: Room[]) => {
    if (!rooms || rooms.length === 0) return null;
    const prices = rooms.map(r => r.pricePerSemester);
    return Math.min(...prices);
  };

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  return (
    <div className="w-full min-h-screen bg-white text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* Header */}
      <div className="w-full border-b border-slate-900 px-4 md:px-8 lg:px-12 py-12 md:py-24">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 border border-slate-900 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-slate-900"></span>
              Explore
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-heading font-bold uppercase tracking-tighter leading-none">
              Hostels.
            </h1>
          </div>
          
          <div className="md:text-right">
            <p className="text-slate-500 font-medium text-base md:text-lg max-w-sm">
              Discover verified accommodations tailored for students of Catholic University of Ghana.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
        {/* Top Search Bar - Responsive Stacking */}
        <div className="border border-slate-900 flex flex-col md:flex-row items-stretch mb-8 md:mb-12">
          <div className="flex-1 p-4 md:p-6 border-b md:border-b-0 md:border-r border-slate-900">
            <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1 md:mb-2">Location / Name</label>
            <input 
              type="text"
              placeholder="Where are you looking?"
              className="w-full bg-transparent border-none outline-none text-base md:text-lg font-medium text-slate-900 placeholder:text-slate-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="hidden md:block flex-1 p-6 border-r border-slate-900">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Room Type</label>
            <select 
              className="w-full bg-transparent border-none outline-none text-lg font-medium text-slate-900 appearance-none cursor-pointer"
              value={roomTypeFilter}
              onChange={(e) => setRoomTypeFilter(e.target.value)}
            >
              <option value="all">Any Type</option>
              <option value="1-in-a-room">1 in a room</option>
              <option value="2-in-a-room">2 in a room</option>
              <option value="3-in-a-room">3 in a room</option>
              <option value="4-in-a-room">4 in a room</option>
            </select>
          </div>
          <div className="hidden md:block flex-1 p-6 border-r border-slate-900">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Max Price</label>
            <input 
              type="number"
              placeholder="GH₵ Any"
              className="w-full bg-transparent border-none outline-none text-lg font-medium text-slate-900 placeholder:text-slate-300"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          <div className="p-4 md:p-6 shrink-0 flex items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
            <Search className="w-5 h-5 md:w-6 md:h-6 text-slate-900" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-4 md:gap-6">
          <div className="flex items-center justify-between w-full md:w-auto">
            <h2 className="text-lg md:text-xl font-heading font-bold uppercase tracking-tighter">
              Found {filteredHostels.length} results
            </h2>
            <button 
              className="md:hidden flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-white px-4 py-2"
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            >
              <Filter className="w-3 h-3" /> Filters
            </button>
          </div>
          
          {/* Filter Pills - Scrollable on mobile */}
          <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full md:w-auto -mx-4 px-4 md:mx-0 md:px-0">
            {['all', '1-in-a-room', '2-in-a-room', '3-in-a-room', '4-in-a-room'].map((type) => (
              <button 
                key={type}
                onClick={() => setRoomTypeFilter(type)}
                className={`px-4 py-2 md:px-6 md:py-3 border rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${roomTypeFilter === type ? 'bg-slate-900 text-white border-slate-900' : 'bg-transparent text-slate-900 border-slate-900 hover:bg-slate-50'}`}
              >
                {type === 'all' ? 'All Types' : type.replace(/-/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Filters Dropdown */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileFiltersOpen ? 'max-h-[500px] mb-8 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-6 bg-slate-50 border border-slate-900 space-y-8">
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Price range</h4>
              <input 
                type="number" 
                placeholder="Max GH₵" 
                className="w-full bg-white border border-slate-900 p-3 text-sm font-medium outline-none"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Location</h4>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setLocationFilter('all')}
                  className={`p-3 text-[10px] font-bold uppercase tracking-widest border transition-colors ${locationFilter === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-900 border-slate-200'}`}
                >
                  Any
                </button>
                {uniqueLocations.map(loc => (
                  <button 
                    key={loc}
                    onClick={() => setLocationFilter(loc)}
                    className={`p-3 text-[10px] font-bold uppercase tracking-widest border transition-colors ${locationFilter === loc ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-900 border-slate-200'}`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
            <button 
              className="w-full bg-slate-900 text-white py-4 text-[10px] font-bold uppercase tracking-widest"
              onClick={() => setIsMobileFiltersOpen(false)}
            >
              Apply Filters
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 md:gap-12">
          {/* Results Grid (Left Side) */}
          <div className="lg:col-span-9">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="aspect-[4/3] bg-slate-100 animate-pulse border border-slate-200"></div>
                ))}
              </div>
            ) : filteredHostels.length === 0 ? (
              <div className="text-center py-16 md:py-24 border border-dashed border-slate-300">
                <p className="text-slate-500 text-base md:text-lg mb-6 md:mb-8">No hostels found matching your criteria.</p>
                <button 
                  className="inline-flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-900 pb-1 hover:text-slate-500 hover:border-slate-500 transition-colors"
                  onClick={() => {
                    setSearchQuery('');
                    setLocationFilter('all');
                    setMaxPrice('');
                    setRoomTypeFilter('all');
                  }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-8 md:space-y-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                  {filteredHostels.map(hostel => {
                    const startingPrice = getStartingPrice(hostel.rooms);
                    return (
                      <Link href={`/hostels/${hostel.id}`} key={hostel.id} className="group block border border-slate-900 flex flex-col bg-white">
                        <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden border-b border-slate-900">
                          {hostel.images?.[0] ? (
                            <Image 
                              src={hostel.images[0]} 
                              alt={hostel.name} 
                              fill
                              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No Image</div>
                          )}
                          <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-white text-slate-900 border border-slate-900 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 md:w-3 md:h-3 fill-slate-900" /> {hostel.rating.toFixed(1)}
                          </div>
                          <div className="absolute top-3 right-3 md:top-4 md:right-4 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border border-slate-900 flex items-center justify-center hover:bg-slate-50 transition-colors">
                            <Heart className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-900" />
                          </div>
                        </div>
                        <div className="p-4 md:p-6 flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-1 md:mb-2">
                            <h3 className="text-xl md:text-2xl font-heading font-bold uppercase tracking-tighter truncate pr-4">{hostel.name}</h3>
                          </div>
                          <p className="text-xs md:text-sm text-slate-500 mb-4 md:mb-6 truncate">{hostel.address}, {hostel.location}</p>
                          
                          <div className="mt-auto pt-4 md:pt-6 border-t border-slate-200 flex justify-between items-end">
                            <div>
                              <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5 md:mb-1">Starting from</p>
                              <p className="text-slate-900">
                                <span className="font-bold text-lg md:text-xl">{startingPrice ? `GH₵${startingPrice}` : 'N/A'}</span>
                                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">/sem</span>
                              </p>
                            </div>
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-slate-900 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                              <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                
                {hasMore && (
                  <div className="flex justify-center pt-8 border-t border-slate-200">
                    <button 
                      onClick={() => loadHostels(false)}
                      disabled={isLoading}
                      className="group flex items-center justify-center bg-transparent border border-slate-900 text-slate-900 px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading...</>
                      ) : (
                        'Load More Hostels'
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Filters Sidebar (Right Side) */}
          <div className="hidden lg:block lg:col-span-3 space-y-12">
            <div className="sticky top-32 space-y-12">
              <div className="flex justify-between items-center border-b border-slate-900 pb-4">
                <h3 className="text-xl font-heading font-bold uppercase tracking-tighter">Filters</h3>
                <button 
                  className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors"
                  onClick={() => {
                    setSearchQuery('');
                    setLocationFilter('all');
                    setMaxPrice('');
                    setRoomTypeFilter('all');
                  }}
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900">Price range</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Maximum (GH₵)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 5000" 
                      className="w-full bg-transparent border-b border-slate-300 focus:border-slate-900 outline-none py-2 text-sm font-medium transition-colors"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900">Location</h4>
                <div className="space-y-4">
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div className={`w-5 h-5 border flex items-center justify-center transition-colors ${locationFilter === 'all' ? 'border-slate-900 bg-slate-900' : 'border-slate-300 group-hover:border-slate-900'}`}>
                      {locationFilter === 'all' && <div className="w-2 h-2 bg-white" />}
                    </div>
                    <input 
                      type="radio" 
                      name="location" 
                      className="hidden" 
                      checked={locationFilter === 'all'}
                      onChange={() => setLocationFilter('all')}
                    />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">Any Location</span>
                  </label>
                  
                  {uniqueLocations.map(loc => (
                    <label key={loc} className="flex items-center gap-4 cursor-pointer group">
                      <div className={`w-5 h-5 border flex items-center justify-center transition-colors ${locationFilter === loc ? 'border-slate-900 bg-slate-900' : 'border-slate-300 group-hover:border-slate-900'}`}>
                        {locationFilter === loc && <div className="w-2 h-2 bg-white" />}
                      </div>
                      <input 
                        type="radio" 
                        name="location" 
                        className="hidden"
                        checked={locationFilter === loc}
                        onChange={() => setLocationFilter(loc)}
                      />
                      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{loc}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
