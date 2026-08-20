import React, { useState } from 'react';
import { fetchNearbyHospitals, Hospital } from '../utils/locationService';

interface NearbyDoctorsProps {
    searchType?: 'oncology' | 'radiology' | 'general';
    title?: string;
}

const NearbyDoctors: React.FC<NearbyDoctorsProps> = ({
    searchType = 'general',
    title = 'Nearby Recommended Doctors & Clinics',
}) => {
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [hasFetched, setHasFetched] = useState(false);

    const handleFind = () => {
        setIsFetching(true);
        setLocationError(null);
        setHospitals([]);

        if (!('geolocation' in navigator)) {
            setIsFetching(false);
            setLocationError('Geolocation is not supported by this browser.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const results = await fetchNearbyHospitals(latitude, longitude, searchType);
                    setHospitals(results);
                    setHasFetched(true);
                    if (results.length === 0) {
                        setLocationError('No clinics found within range. Try again or expand your search area.');
                    }
                } catch (err) {
                    setLocationError('Failed to fetch location data. Please check your connection and try again.');
                } finally {
                    setIsFetching(false);
                }
            },
            (err) => {
                setIsFetching(false);
                if (err.code === 1) {
                    setLocationError('Location access denied. Please enable location permissions in your browser settings.');
                } else {
                    setLocationError('Unable to determine your location. Please try again.');
                }
            },
            { timeout: 12000 }
        );
    };

    const getMapsUrl = (hospital: Hospital) => {
        if (hospital.lat && hospital.lon) {
            return `https://www.google.com/maps/search/?api=1&query=${hospital.lat},${hospital.lon}`;
        }
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name + ' ' + hospital.address)}`;
    };

    const specialtyLabel = searchType === 'oncology' ? 'Oncology Centers' : searchType === 'radiology' ? 'Radiology & Imaging Centers' : 'Hospitals & Clinics';

    return (
        <div className="mt-8 bg-slate-900/40 backdrop-blur-2xl p-6 md:p-8 rounded-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative overflow-hidden">
            {/* Top Accent Bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600"></div>

            {/* Glow blob */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-cyan-500/20 rounded-xl border border-cyan-500/20">
                            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">{title}</h3>
                            <p className="text-xs text-slate-400 font-medium">{specialtyLabel} · Live data via OpenStreetMap</p>
                        </div>
                    </div>

                    <button
                        onClick={handleFind}
                        disabled={isFetching}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl text-sm font-bold text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all active:scale-95 whitespace-nowrap"
                    >
                        {isFetching ? (
                            <>
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                                Locating...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {hasFetched ? 'Refresh Location' : 'Find Near Me'}
                            </>
                        )}
                    </button>
                </div>

                {/* Error State */}
                {locationError && (
                    <div className="p-4 bg-red-900/30 border border-red-500/30 rounded-2xl text-red-300 text-sm font-medium flex items-start gap-3">
                        <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {locationError}
                    </div>
                )}

                {/* Loading shimmer */}
                {isFetching && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/5 animate-pulse space-y-3">
                                <div className="h-3 bg-slate-700 rounded w-3/4"></div>
                                <div className="h-2 bg-slate-700/60 rounded w-1/2"></div>
                                <div className="h-8 bg-slate-700/40 rounded-xl mt-4"></div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Results Grid */}
                {!isFetching && hospitals.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {hospitals.map((h, idx) => (
                            <div
                                key={idx}
                                className="group bg-white/5 hover:bg-white/10 rounded-2xl p-4 border border-white/5 hover:border-cyan-500/30 transition-all duration-300 flex flex-col gap-3"
                                style={{ animationDelay: `${idx * 80}ms` }}
                            >
                                {/* Location Icon + Name */}
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors flex-shrink-0">
                                        <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                        </svg>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-white text-sm leading-tight line-clamp-2 group-hover:text-cyan-300 transition-colors">{h.name}</p>
                                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{h.address}</p>
                                    </div>
                                </div>

                                {/* Distance Badge */}
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                                        📍 {h.distanceInfo || 'Nearby'}
                                    </span>
                                </div>

                                {/* Directions Button */}
                                <a
                                    href={getMapsUrl(h)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-auto flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-400/40 text-cyan-400 text-xs font-bold transition-all group-hover:shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                    Get Directions
                                </a>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty initial state */}
                {!isFetching && !locationError && hospitals.length === 0 && (
                    <div className="text-center py-10 text-slate-500 border border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                        <div className="inline-block p-4 bg-slate-800/50 rounded-full mb-3">
                            <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <p className="font-semibold text-slate-400 text-sm">Click "Find Near Me" to discover nearby doctors</p>
                        <p className="text-xs mt-1 text-slate-600">Uses real-time OpenStreetMap data · No sign-in required</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NearbyDoctors;
