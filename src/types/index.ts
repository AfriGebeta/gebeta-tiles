import { Map } from 'maplibre-gl';
import React, { ReactNode, MutableRefObject } from 'react';

export interface ClickEvent {
  lngLat: [number, number];
  point: [number, number];
}

export type GebetaMapStyle = 'basic' | 'gebeta_light' | 'modern' | Record<string, any>;

export interface ImageSize {
  width: number;
  height: number;
}

export interface MarkerConfig {
  id: string;
  lngLat: [number, number];
  color?: string;
  isSelected?: boolean;
  onClick?: () => void;
  image?: string;
  imageSize?: ImageSize;
}

export interface PolylineConfig {
  id: string;
  coordinates: [number, number][];
  color?: string;
  width?: number;
}

export interface PolyfillConfig {
  id: string;
  coordinates: [number, number][];
  fillColor?: string;
  outlineColor?: string;
  outlineWidth?: number;
  fillOpacity?: number;
}

export interface ClusterConfig {
  radius?: number;
  maxZoom?: number;
  minPoints?: number;
  color?: string;
  textColor?: string;
}

export interface MapConfig {
  apiKey: string;
  center: [number, number];
  zoom: number;
  style?: GebetaMapStyle;
  markers?: MarkerConfig[];
  polylines?: PolylineConfig[];
  polyfills?: PolyfillConfig[];
  clustering?: ClusterConfig;
  onMapLoad?: (map: Map) => void;
  onMapClick?: (event: ClickEvent) => void;
  className?: string;
  children?: ReactNode;
  mapRef?: MutableRefObject<Map | null>;
}

// Component Props
export interface MapMarkerProps extends MarkerConfig {
  'data-testid'?: string;
}

export interface MapPolylineProps extends PolylineConfig {
  'data-testid'?: string;
}

export interface MapPolyfillProps extends PolyfillConfig {
  'data-testid'?: string;
}

export interface MapClusterProps {
  map: Map;
  markers: MarkerConfig[];
  config?: ClusterConfig;
  'data-testid'?: string;
  onClusterClick?: (clusterId: number, coordinates: [number, number]) => void;
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
} 