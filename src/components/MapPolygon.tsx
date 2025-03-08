import React, { useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import { useMap } from '../context/MapContext';

export interface MapPolygonProps {
  id: string;
  coordinates: [number, number][];
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  'data-testid'?: string;
}

const MapPolygon = React.forwardRef<maplibregl.Map, MapPolygonProps>(({
  id,
  coordinates,
  fillColor = 'rgba(255, 0, 0, 0.2)',
  strokeColor = '#FF0000',
  strokeWidth = 2,
  'data-testid': dataTestId,
}, ref) => {
  const map = useMap();

  useEffect(() => {
    const source = `polygon-source-${id}`;
    const layer = `polygon-layer-${id}`;
    const outlineLayer = `${layer}-outline`;

    const addSourceAndLayer = () => {
      try {
        // Add source
        map.addSource(source, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Polygon',
              coordinates: [coordinates],
            },
          },
        });

        // Add fill layer
        map.addLayer({
          id: layer,
          type: 'fill',
          source: source,
          paint: {
            'fill-color': fillColor,
            'fill-opacity': 0.6,
          },
        });

        // Add outline layer
        map.addLayer({
          id: outlineLayer,
          type: 'line',
          source: source,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': strokeColor,
            'line-width': strokeWidth,
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
        console.error('Error adding polygon:', error);
      }
    };

    // Wait for style to be fully loaded
    if (!map.isStyleLoaded()) {
      map.once('style.load', addSourceAndLayer);
    } else {
      addSourceAndLayer();
    }

    return () => {
      try {
        if (map.getLayer(outlineLayer)) {
          map.removeLayer(outlineLayer);
        }
        if (map.getLayer(layer)) {
          map.removeLayer(layer);
        }
        if (map.getSource(source)) {
          map.removeSource(source);
        }
      } catch (error) {
        console.error('Error cleaning up polygon:', error);
      }
    };
  }, [map, id, coordinates, fillColor, strokeColor, strokeWidth, dataTestId, ref]);

  return null;
});

MapPolygon.displayName = 'MapPolygon';

export default MapPolygon; 