import { useEffect, useRef, useState } from 'react';
import maplibregl from 'trackasia-gl';
import type { Store } from '@/types';

interface StoreMapProps {
  stores: Store[];
  selectedStore: Store | null;
  onSelect: (store: Store) => void;
}

const defaultCenter: [number, number] = [106.6297, 10.8231]; // [lng, lat]
const defaultZoom = 12;

export const StoreMap = ({ stores, selectedStore, onSelect }: StoreMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<{ [key: number]: maplibregl.Marker }>({});
  const popupsRef = useRef<{ [key: number]: maplibregl.Popup }>({});
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: defaultCenter,
      zoom: defaultZoom,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setIsMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Add markers for all stores
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    // Remove existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    Object.values(popupsRef.current).forEach((popup) => popup.remove());
    markersRef.current = {};
    popupsRef.current = {};

    // Add new markers
    stores.forEach((store) => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="%237F5539"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>')`;
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.backgroundSize = 'contain';
      el.style.cursor = 'pointer';

      const popup = new maplibregl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false,
      }).setHTML(`
        <div style="padding: 8px;">
          <h3 style="font-weight: 600; font-size: 16px; margin-bottom: 4px; color: #1f2937;">${store.name}</h3>
          <p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">${store.address}</p>
          <p style="font-size: 14px; color: #6b7280;">${store.phone}</p>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([store.longitude, store.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        onSelect(store);
      });

      markersRef.current[store.id] = marker;
      popupsRef.current[store.id] = popup;
    });
  }, [stores, isMapLoaded, onSelect]);

  // Handle selected store
  useEffect(() => {
    if (!map.current || !selectedStore) return;

    // Close all popups
    Object.values(popupsRef.current).forEach((popup) => {
      if (popup.isOpen()) popup.remove();
    });

    // Open selected store's popup
    const marker = markersRef.current[selectedStore.id];
    const popup = popupsRef.current[selectedStore.id];

    if (marker && popup) {
      map.current.flyTo({
        center: [selectedStore.longitude, selectedStore.latitude],
        zoom: 15,
        duration: 1000,
      });

      // Small delay to ensure flyTo starts before opening popup
      setTimeout(() => {
        if (!popup.isOpen()) {
          marker.togglePopup();
        }
      }, 100);
    }
  }, [selectedStore]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">Loading map...</p>
        </div>
      )}
    </div>
  );
};
