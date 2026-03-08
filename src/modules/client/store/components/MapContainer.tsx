import { useEffect, useRef } from 'react';
import maplibregl from 'trackasia-gl';
import type { FranchiseDetailResponse } from '@/apis/endpointsCLIENT/franchiseDetail.api';

export function parseCoords(googleMapScript: string): { lng: number; lat: number } | null {
  const lngMatch = googleMapScript.match(/!2d(-?\d+\.\d+)/);
  const latMatch = googleMapScript.match(/!3d(-?\d+\.\d+)/);
  if (!lngMatch || !latMatch) return null;
  return { lng: parseFloat(lngMatch[1]), lat: parseFloat(latMatch[1]) };
}

interface Props {
  franchise: FranchiseDetailResponse;
}

export function MapContainer({ franchise }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const coords = parseCoords(franchise.google_map_script);

  useEffect(() => {
    if (!containerRef.current || !coords) return;

    const { lng, lat } = coords;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [lng, lat],
      zoom: 15,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {
      new maplibregl.Marker({ color: '#7F5539' })
        .setLngLat([lng, lat])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(
            `<div style="padding:6px 4px;max-width:200px">
              <p style="font-weight:700;font-size:14px;margin-bottom:4px">${franchise.name}</p>
              <p style="font-size:12px;color:#6b7280">${franchise.address}</p>
            </div>`,
          ),
        )
        .addTo(map);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [franchise._id]);

  if (!coords) {
    return (
      <iframe
        src={franchise.google_map_script}
        className="w-full h-full border-0"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }

  return <div ref={containerRef} className="w-full h-full" />;
}

