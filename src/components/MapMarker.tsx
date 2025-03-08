import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { useMap } from '../context/MapContext';
import type { MapMarkerProps } from '../types';

const MapMarker = React.forwardRef<maplibregl.Marker, MapMarkerProps>(({
  id,
  lngLat,
  color = '#FF0000',
  isSelected = false,
  onClick,
  image,
  imageSize = { width: 32, height: 32 },
  'data-testid': dataTestId,
}, ref) => {
  const map = useMap();
  const markerRef = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    if (!map) return;

    const createMarkerElement = () => {
      const el = document.createElement('div');
      el.className = 'gebeta-marker';
      el.setAttribute('data-testid', dataTestId || `marker-${id}`);
      
      if (image) {
        // Create image marker
        el.style.backgroundImage = `url(${image})`;
        el.style.backgroundSize = 'contain';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.backgroundPosition = 'center';
        el.style.width = `${imageSize.width}px`;
        el.style.height = `${imageSize.height}px`;
        el.style.borderRadius = '0';
        el.style.cursor = onClick ? 'pointer' : 'default';
      } else {
        // Create default circular marker
        el.style.backgroundColor = color;
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.borderRadius = '50%';
        el.style.border = isSelected ? '3px solid #FFFFFF' : 'none';
        el.style.cursor = onClick ? 'pointer' : 'default';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      }

      return el;
    };

    const markerElement = createMarkerElement();
    
    markerRef.current = new maplibregl.Marker({
      element: markerElement,
      anchor: 'center'
    })
      .setLngLat(lngLat)
      .addTo(map);

    if (onClick) {
      markerElement.addEventListener('click', onClick);
    }

    if (typeof ref === 'function') {
      ref(markerRef.current);
    } else if (ref) {
      ref.current = markerRef.current;
    }

    return () => {
      if (onClick) {
        markerElement.removeEventListener('click', onClick);
      }
      markerRef.current?.remove();
    };
  }, [map, id, lngLat, color, isSelected, onClick, image, imageSize, dataTestId, ref]);

  // Update marker position if lngLat changes
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLngLat(lngLat);
    }
  }, [lngLat]);

  return null;
});

MapMarker.displayName = 'MapMarker';

export default MapMarker; 