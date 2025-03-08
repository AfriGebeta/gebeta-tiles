import { Map } from 'maplibre-gl';
import { ComponentType, ReactNode } from 'react';

// Base types
export type GebetaMapStyle = 'light' | 'dark' | 'satellite' | 'streets';

export interface ImageSize {
  width: number;
  height: number;
}

// Configuration types
export interface MarkerConfig {
  id: string;
  lngLat: [number, number];
  color?: string;
  onClick?: () => void;
  isSelected?: boolean;
}

export interface PolylineConfig {
  id: string;
  coordinates: [number, number][];
  color?: string;
  width?: number;
}

export interface PolygonConfig {
  id: string;
  coordinates: [number, number][];
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface ClusterConfig {
  radius?: number;
  maxZoom?: number;
  minPoints?: number;
  color?: string;
  textColor?: string;
}

// Component Props
export interface MapConfig {
  apiKey: string;
  center: [number, number];
  zoom: number;
  style?: string | Record<string, any>;
  onMapLoad?: (map: Map) => void;
  onMapClick?: (event: { lngLat: [number, number]; point: [number, number] }) => void;
  className?: string;
  children?: ReactNode;
}

export interface MapMarkerProps extends MarkerConfig {
  map: Map;
  'data-testid'?: string;
}

export interface MapPolylineProps extends PolylineConfig {
  map: Map;
  'data-testid'?: string;
}

export interface MapPolygonProps extends PolygonConfig {
  map: Map;
  'data-testid'?: string;
}

export interface MapClusterProps {
  map: Map;
  markers: (MarkerConfig & { onClick?: () => void; isSelected?: boolean; })[];
  config?: ClusterConfig;
  'data-testid'?: string;
}

// Component exports
export const GebetaMap: ComponentType<MapConfig>;
export const MapMarker: ComponentType<MapMarkerProps>;
export const MapPolyline: ComponentType<MapPolylineProps>;
export const MapPolygon: ComponentType<MapPolygonProps>;
export const MapCluster: ComponentType<MapClusterProps>; 