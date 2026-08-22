'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Plus, Minus, Layers, School, Building2, Hospital, ShoppingCart } from 'lucide-react';

interface MapProps {
  lat?: number;
  lng?: number;
  address?: string;
  nearbyPlaces?: Array<{ name: string; type: string; distance?: string; distanceKm?: number }>;
  onLocationSelect?: (lat: number, lng: number, address?: string) => void;
  onClick?: () => void;
  interactive?: boolean;
}

export default function MockMap({
  lat = 28.5355,
  lng = 77.3910,
  address,
  nearbyPlaces = [],
  onLocationSelect,
  onClick,
  interactive = true,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [currentCoords, setCurrentCoords] = useState({ lat, lng });
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);

  useEffect(() => {
    setCurrentCoords({ lat, lng });
  }, [lat, lng]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isMounted = true;

    // Dynamically load Leaflet and Leaflet CSS
    const loadLeaflet = async () => {
      try {
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        const L = (await import('leaflet')).default;

        if (!isMounted || !mapRef.current) return;

        // Clean up previous map instance if exists
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
        }

        const map = L.map(mapRef.current, {
          center: [currentCoords.lat, currentCoords.lng],
          zoom: 14,
          zoomControl: false,
          attributionControl: false,
        });

        // Add high-resolution OpenStreetMap tiles without attribution watermark
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '',
        }).addTo(map);

        // Custom red pin for primary property location
        const customPinIcon = L.divIcon({
          className: 'custom-property-pin',
          html: `
            <div style="position: relative; transform: translate(-50%, -100%);">
              <div style="background-color: #EF4444; width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.4); border: 2px solid white;">
                <div style="width: 12px; height: 12px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
              </div>
              <div style="position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 14px; height: 4px; background: rgba(0,0,0,0.3); border-radius: 50%; filter: blur(2px);"></div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
        });

        const marker = L.marker([currentCoords.lat, currentCoords.lng], {
          icon: customPinIcon,
          draggable: interactive,
        }).addTo(map);

        if (address) {
          marker.bindPopup(`<b>${address}</b><br/>Lat: ${currentCoords.lat.toFixed(4)}, Lng: ${currentCoords.lng.toFixed(4)}`).openPopup();
        }

        if (interactive) {
          marker.on('dragend', (e: any) => {
            const pos = e.target.getLatLng();
            setCurrentCoords({ lat: pos.lat, lng: pos.lng });
            if (onLocationSelect) {
              onLocationSelect(pos.lat, pos.lng);
            }
          });

          map.on('click', (e: any) => {
            const { lat: clickLat, lng: clickLng } = e.latlng;
            marker.setLatLng([clickLat, clickLng]);
            setCurrentCoords({ lat: clickLat, lng: clickLng });
            if (onLocationSelect) {
              onLocationSelect(clickLat, clickLng);
            }
            if (onClick) {
              onClick();
            }
          });
        }

        // Add nearby places markers
        nearbyPlaces.forEach((place) => {
          const offsetLat = currentCoords.lat + (Math.random() - 0.5) * 0.015;
          const offsetLng = currentCoords.lng + (Math.random() - 0.5) * 0.015;

          const amenityIcon = L.divIcon({
            className: 'amenity-pin',
            html: `
              <div style="background: #2563EB; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.2); border: 1.5px solid white;">
                📍 ${place.name} (${place.distance || 'nearby'})
              </div>
            `,
            iconSize: [120, 24],
          });

          L.marker([offsetLat, offsetLng], { icon: amenityIcon }).addTo(map);
        });

        leafletMapRef.current = map;
        markerRef.current = marker;
        setIsLeafletLoaded(true);
      } catch (err) {
        console.warn('Leaflet map load error:', err);
      }
    };

    loadLeaflet();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [currentCoords.lat, currentCoords.lng, interactive, address]);

  const handleZoomIn = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.zoomOut();
    }
  };

  const handleRecenter = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([currentCoords.lat, currentCoords.lng], 15);
    }
  };

  return (
    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
      <div ref={mapRef} className="w-full h-full z-0" />

      {/* Floating Map Controls */}
      <div className="absolute right-3 top-3 flex flex-col gap-1.5 z-[400]">
        <button
          onClick={handleZoomIn}
          className="w-9 h-9 bg-white dark:bg-dark-navy text-dark-navy dark:text-white rounded-xl shadow-md flex items-center justify-center hover:bg-gray-50 transition-all font-bold border border-gray-100 dark:border-gray-700"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-9 h-9 bg-white dark:bg-dark-navy text-dark-navy dark:text-white rounded-xl shadow-md flex items-center justify-center hover:bg-gray-50 transition-all font-bold border border-gray-100 dark:border-gray-700"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleRecenter}
          className="w-9 h-9 bg-white dark:bg-dark-navy text-primary-blue rounded-xl shadow-md flex items-center justify-center hover:bg-gray-50 transition-all font-bold border border-gray-100 dark:border-gray-700"
          title="Recenter Map"
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>

      {/* Location Badge */}
      <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-dark-navy/95 backdrop-blur-sm px-3.5 py-1.5 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 z-[400] flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-success-green animate-pulse" />
        <span className="text-xs font-semibold text-dark-navy dark:text-white">
          {currentCoords.lat.toFixed(4)}° N, {currentCoords.lng.toFixed(4)}° E
        </span>
      </div>
    </div>
  );
}
