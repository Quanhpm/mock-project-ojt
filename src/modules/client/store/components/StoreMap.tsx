import { useEffect, useRef, useState } from 'react';
import { GoogleMap, InfoWindow, Marker, useLoadScript } from '@react-google-maps/api';
import type { Store } from '@/types';

interface StoreMapProps {
  stores: Store[];
  selectedStore: Store | null;
  onSelect: (store: Store) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 10.8231,
  lng: 106.6297,
};

const defaultZoom = 12;

export const StoreMap = ({ stores, selectedStore, onSelect }: StoreMapProps) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY || '',
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [activeMarkerId, setActiveMarkerId] = useState<number | null>(null);

  useEffect(() => {
    if (selectedStore && mapRef.current) {
      mapRef.current.panTo({
        lat: selectedStore.latitude,
        lng: selectedStore.longitude,
      });
      mapRef.current.setZoom(15);
      setActiveMarkerId(selectedStore.id);
    }
  }, [selectedStore]);

  const handleMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  const handleMarkerClick = (store: Store) => {
    setActiveMarkerId(store.id);
    onSelect(store);
  };

  const handleInfoWindowClose = () => {
    setActiveMarkerId(null);
  };

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Error loading maps</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={defaultCenter}
      zoom={defaultZoom}
      onLoad={handleMapLoad}
    >
      {stores.map((store) => (
        <Marker
          key={store.id}
          position={{ lat: store.latitude, lng: store.longitude }}
          onClick={() => handleMarkerClick(store)}
        >
          {activeMarkerId === store.id && (
            <InfoWindow onCloseClick={handleInfoWindowClose}>
              <div className="p-2">
                <h3 className="font-semibold text-lg mb-1">{store.name}</h3>
                <p className="text-sm text-gray-600 mb-1">{store.address}</p>
                <p className="text-sm text-gray-600">{store.phone}</p>
              </div>
            </InfoWindow>
          )}
        </Marker>
      ))}
    </GoogleMap>
  );
};
