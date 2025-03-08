import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import Supercluster from 'supercluster';
import type { MarkerConfig, ClusterConfig } from '../types';
import { useMap } from '../context/MapContext';

interface ClusterProperties {
  id: string;
  color?: string;
  isSelected?: boolean;
  onClick?: () => void;
  cluster?: boolean;
  point_count?: number;
  cluster_id?: number;
}

export interface MapClusterProps {
  markers: MarkerConfig[];
  config?: ClusterConfig;
  'data-testid'?: string;
  onClusterClick?: (clusterId: number, coordinates: [number, number]) => void;
}

const MapCluster = React.memo(React.forwardRef<maplibregl.Map, MapClusterProps>(({
  markers,
  config = {},
  'data-testid': dataTestId,
  onClusterClick,
}, ref) => {
  const map = useMap();
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const superclusterRef = useRef<Supercluster>();
  const configRef = useRef(config);
  const markersDataRef = useRef(markers);

  // Update refs when props change
  useEffect(() => {
    configRef.current = config;
    markersDataRef.current = markers;
  }, [config, markers]);

  // Memoize the points creation
  const points = useMemo(() => 
    markers.map(marker => ({
      type: 'Feature' as const,
      properties: {
        id: marker.id,
        color: marker.color,
        isSelected: marker.isSelected,
        onClick: marker.onClick,
      },
      geometry: {
        type: 'Point' as const,
        coordinates: marker.lngLat,
      },
    })), [markers]);

  // Memoize supercluster initialization
  const initializeSupercluster = useCallback(() => {
    if (!superclusterRef.current) {
      superclusterRef.current = new Supercluster({
        radius: config.radius || 50,
        maxZoom: config.maxZoom || 16,
        minPoints: config.minPoints || 2,
      });
    }
    superclusterRef.current.load(points);
  }, [config.radius, config.maxZoom, config.minPoints, points]);

  const createMarkerElement = useCallback((cluster: any) => {
    const el = document.createElement('div');
    
    if (cluster.properties.cluster) {
      el.className = 'map-cluster';
      el.style.backgroundColor = configRef.current.color || '#FF0000';
      el.style.color = configRef.current.textColor || '#FFFFFF';
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.borderRadius = '50%';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.cursor = 'pointer';
      el.textContent = String(cluster.properties.point_count);
      if (dataTestId) {
        el.setAttribute('data-testid', `${dataTestId}-cluster`);
      }
      if (onClusterClick) {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onClusterClick(cluster.properties.cluster_id, cluster.geometry.coordinates as [number, number]);
        });
      }
    } else {
      el.className = 'map-marker';
      el.style.backgroundColor = cluster.properties.color || '#FF0000';
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.border = cluster.properties.isSelected ? '2px solid #000' : 'none';
      if (dataTestId) {
        el.setAttribute('data-testid', `${dataTestId}-marker-${cluster.properties.id}`);
      }
      if (cluster.properties.onClick) {
        const handleClick = (e: MouseEvent) => {
          e.stopPropagation();
          cluster.properties.onClick();
        };
        el.addEventListener('click', handleClick);
      }
    }
    
    return el;
  }, [dataTestId, onClusterClick]);

  const updateClusters = useCallback(() => {
    if (!map || !superclusterRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const bounds = map.getBounds();
    const zoom = Math.floor(map.getZoom());

    const clusters = superclusterRef.current.getClusters(
      [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
      zoom
    );

    clusters.forEach(cluster => {
      const [longitude, latitude] = cluster.geometry.coordinates;
      const el = createMarkerElement(cluster);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([longitude, latitude])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [map, createMarkerElement]);

  useEffect(() => {
    if (!map || !markers.length) return;

    initializeSupercluster();

    const handleMapUpdate = () => {
      requestAnimationFrame(updateClusters);
    };

    map.on('moveend', handleMapUpdate);
    map.on('zoomend', handleMapUpdate);

    // Initial update
    updateClusters();

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      map.off('moveend', handleMapUpdate);
      map.off('zoomend', handleMapUpdate);
    };
  }, [map, markers, initializeSupercluster, updateClusters]);

  return null;
}),
  // Custom comparison function for memo
  (prevProps, nextProps) => {
    if (prevProps.markers.length !== nextProps.markers.length) return false;
    
    return prevProps.markers.every((marker, index) => {
      const nextMarker = nextProps.markers[index];
      return (
        marker.id === nextMarker.id &&
        marker.lngLat[0] === nextMarker.lngLat[0] &&
        marker.lngLat[1] === nextMarker.lngLat[1] &&
        marker.color === nextMarker.color &&
        marker.isSelected === nextMarker.isSelected
      );
    }) &&
    JSON.stringify(prevProps.config) === JSON.stringify(nextProps.config) &&
    prevProps['data-testid'] === nextProps['data-testid'] &&
    prevProps.onClusterClick === nextProps.onClusterClick;
  }
);

MapCluster.displayName = 'MapCluster';

export default MapCluster; 