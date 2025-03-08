import React, { useEffect } from 'react';
import { useMap } from '../context/MapContext';
import type { MapPolylineProps } from '../types';

const MapPolyline = React.forwardRef<maplibregl.Map, MapPolylineProps>(({
  id,
  coordinates,
  color = '#FF0000',
  width = 2,
  'data-testid': dataTestId,
}, ref) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return; // Early return if no map instance

    const source = `polyline-source-${id}`;
    const layer = `polyline-layer-${id}`;

    const addSourceAndLayer = () => {
      try {
        // Remove existing layers and source if they exist
        if (map.getLayer(layer)) map.removeLayer(layer);
        if (map.getSource(source)) map.removeSource(source);

        // Add source
        map.addSource(source, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates,
            },
          },
        });

        // Add layer
        map.addLayer({
          id: layer,
          type: 'line',
          source: source,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
            'visibility': 'visible'
          },
          paint: {
            'line-color': color,
            'line-width': width,
          },
        });

        // Add data-testid if provided
        if (dataTestId) {
          const canvas = map.getCanvas();
          canvas.setAttribute('data-testid', dataTestId);
        }

        if (typeof ref === 'function') {
          ref(map);
        } else if (ref) {
          ref.current = map;
        }
      } catch (error) {
        console.error('Error adding polyline:', error);
      }
    };

    // Wait for style to be loaded
    if (!map.isStyleLoaded()) {
      map.once('style.load', addSourceAndLayer);
    } else {
      addSourceAndLayer();
    }

    // Cleanup function
    return () => {
      // Check if map instance still exists and is valid
      if (!map || !map.getStyle()) return;

      try {
        // Check each layer/source before removing
        if (map.getLayer(layer)) {
          map.removeLayer(layer);
        }
        if (map.getSource(source)) {
          map.removeSource(source);
        }
      } catch (error) {
        console.error('Error cleaning up polyline:', error);
      }
    };
  }, [map, id, coordinates, color, width, dataTestId, ref]);

  return null;
});

MapPolyline.displayName = 'MapPolyline';

export default MapPolyline; 