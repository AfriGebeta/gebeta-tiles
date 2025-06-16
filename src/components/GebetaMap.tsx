import React, { useEffect, useRef, useState, useMemo } from 'react';
import maplibregl, { StyleSpecification } from 'maplibre-gl';
import { MapConfig } from '../types';
import { MapContext } from '../context/MapContext';
import MapPolyline from './MapPolyline';
import MapPolyfill from './MapPolyfill';
import basicStyle from '../styles/basic.json';
import gebetaLightStyle from '../styles/gebeta_light.json';
import modernStyle from '../styles/modern.json';
import { MAP_TILE_URL } from '../../constants';
import 'maplibre-gl/dist/maplibre-gl.css';

const GebetaMap: React.FC<MapConfig> = ({
  apiKey,
  center,
  zoom,
  style = 'basic',
  polylines = [],
  polyfills = [],
  onMapLoad,
  onMapClick,
  className,
  children,
  mapRef,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const loadHandlerRef = useRef<((e: maplibregl.MapLibreEvent) => void) | null>(null);

  // Memoize the style configuration
  const mapStyle = useMemo(() => {
    let selectedStyle: StyleSpecification;
    if (typeof style === 'object') {
      selectedStyle = style as StyleSpecification;
    } else {
      switch (style) {
        case 'modern':
          console.log('using modernStyle');
          selectedStyle = modernStyle as StyleSpecification;
          break;
        case 'basic':
          console.log('using basicStyle');
          selectedStyle = basicStyle as StyleSpecification;
          break;
        case 'gebeta_light':
          console.log('using gebeta_light');
          selectedStyle = gebetaLightStyle as StyleSpecification;
          break;
        default:
          selectedStyle = basicStyle as StyleSpecification;
      }
    }

    return {
      ...selectedStyle,
      sources: {
        ...selectedStyle.sources,
        openmaptiles: {
          ...selectedStyle.sources.openmaptiles,
          tiles: [MAP_TILE_URL + '/{z}/{x}/{y}.pbf']
        }
      }
    } as StyleSpecification;
  }, [style]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center,
      zoom,
      attributionControl: false,
      transformRequest: (url: string, resourceType?: string) => {
        if (resourceType === 'Tile') {
          return {
            url: url,
            headers: { 'Authorization': 'Bearer ' + apiKey }
          };
        }
        return { url };
      },
    });

    const mapInstance = map.current;

    // Set the external ref if provided
    if (mapRef) {
      mapRef.current = mapInstance;
    }

    // Store load handler reference so we can remove it later
    loadHandlerRef.current = () => {
      if (!mapInstance) return;
      setIsMapLoaded(true);
      if (onMapLoad) {
        onMapLoad(mapInstance);
      }
    };

    // Setup event handlers
    mapInstance.on('load', loadHandlerRef.current);

    if (onMapClick) {
      mapInstance.on('click', (e) => {
        onMapClick({
          lngLat: [e.lngLat.lng, e.lngLat.lat],
          point: [e.point.x, e.point.y],
        });
      });
    }

    return () => {
      if (mapInstance) {
        if (loadHandlerRef.current) {
          mapInstance.off('load', loadHandlerRef.current);
        }
        mapInstance.remove();
        map.current = null;
        if (mapRef) {
          mapRef.current = null;
        }
        setIsMapLoaded(false);
      }
    };
  }, [apiKey, center, zoom, onMapLoad, onMapClick, mapStyle, mapRef]);

  return (
    <div 
      ref={mapContainer} 
      className={className}
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative',
      }}
    >
      {isMapLoaded && map.current && (
        <MapContext.Provider value={map.current}>
          {polylines.map(polyline => (
            <MapPolyline
              key={polyline.id}
              {...polyline}
            />
          ))}
          {polyfills.map(polyfill => (
            <MapPolyfill
              key={polyfill.id}
              {...polyfill}
            />
          ))}
          {children}
        </MapContext.Provider>
      )}
    </div>
  );
};

export default GebetaMap; 