import GebetaMap from './components/GebetaMap';
import MapMarker from './components/MapMarker';
import MapPolyline from './components/MapPolyline';
import MapPolyfill from './components/MapPolyfill';
import MapCluster from './components/MapCluster';
import type { Map } from 'maplibre-gl';

const GebetaMapBundle = {
    GebetaMap,
    MapMarker,
    MapPolyline,
    MapPolyfill,
    MapCluster
};

export default GebetaMapBundle;

export { default as GebetaMap } from './components/GebetaMap';
export { default as MapMarker } from './components/MapMarker';
export { default as MapPolyline } from './components/MapPolyline';
export { default as MapPolyfill } from './components/MapPolyfill';
export { default as MapCluster } from './components/MapCluster';

export * from './types';
export type { Map };

// Export types
export type { 
  MapConfig,
  MarkerConfig,
  PolylineConfig,
  ClusterConfig,
  PolyfillConfig,
} from './types';
export type { MapMarkerProps } from './types';
export type { MapPolylineProps } from './types';
export type { MapPolyfillProps } from './types';
export type { MapClusterProps } from './types'; 