import React, { useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import { useMap } from '../context/MapContext';
import type { MapPolyfillProps } from '../types';

const MapPolyfill = React.forwardRef<maplibregl.Map, MapPolyfillProps>(({
  id,
  coordinates,
  fillColor = 'rgba(255, 0, 0, 0.2)',
  outlineColor = '#FF0000',
  outlineWidth = 2,
  fillOpacity = 0.6,
  'data-testid': dataTestId,
}, ref) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    console.log('MapPolyfill mounting with map:', map);
    console.log('Coordinates received:', coordinates);

    const source = `polyfill-source-${id}`;
    const layer = `polyfill-layer-${id}`;
    const outlineLayer = `${layer}-outline`;

    const addSourceAndLayer = () => {
      try {
        console.log('Starting to add polyfill layers...');

        // Remove any existing layers/sources
        if (map.getLayer(outlineLayer)) {
          console.log('Removing existing outline layer');
          map.removeLayer(outlineLayer);
        }
        if (map.getLayer(layer)) {
          console.log('Removing existing fill layer');
          map.removeLayer(layer);
        }
        if (map.getSource(source)) {
          console.log('Removing existing source');
          map.removeSource(source);
        }

        // Create GeoJSON data
        const geojsonData = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [coordinates]  // Note: Coordinates must form a closed loop
          }
        };

        console.log('Adding source with data:', geojsonData);

        // Add source
        map.addSource(source, {
          type: 'geojson',
          data: geojsonData
        });

        // Add fill layer
        console.log('Adding fill layer');
        map.addLayer({
          id: layer,
          type: 'fill',
          source: source,
          paint: {
            'fill-color': fillColor,
            'fill-opacity': 1,  // Using opacity from fillColor
            'fill-antialias': true
          }
        });

        // Add outline layer
        console.log('Adding outline layer');
        map.addLayer({
          id: outlineLayer,
          type: 'line',
          source: source,
          paint: {
            'line-color': outlineColor,
            'line-width': outlineWidth
          }
        });

        // Verify layers were added
        console.log('Layers added. Status:', {
          sourceExists: map.getSource(source) !== undefined,
          fillLayerExists: map.getLayer(layer) !== undefined,
          outlineLayerExists: map.getLayer(outlineLayer) !== undefined
        });

        // Force a repaint
        map.triggerRepaint();

      } catch (error) {
        console.error('Error in MapPolyfill:', error);
        console.error('Map state:', {
          loaded: map.loaded(),
          styleLoaded: map.isStyleLoaded(),
          center: map.getCenter(),
          zoom: map.getZoom()
        });
      }
    };

    // Add a delay to ensure the map is fully ready
    setTimeout(() => {
      if (map.isStyleLoaded()) {
        console.log('Style loaded, adding layers directly');
        addSourceAndLayer();
      } else {
        console.log('Style not loaded, waiting for load event');
        map.once('style.load', () => {
          console.log('Style loaded via event, adding layers');
          addSourceAndLayer();
        });
      }
    }, 1000);

    return () => {
      if (!map || !map.getStyle()) return;
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
        console.error('Error cleaning up:', error);
      }
    };
  }, [map, id, coordinates, fillColor, outlineColor, outlineWidth]);

  return null;
});

MapPolyfill.displayName = 'MapPolyfill';

export default MapPolyfill; 