import React, { useEffect, useRef, useImperativeHandle, forwardRef, useMemo } from "react";
import { GebetaMaps } from "./GebetaMaps.js";
import type * as maplibregl from "maplibre-gl";
import type { Fence, FencePoint } from "./FenceManager.js";
import type { ClusteringOptions } from "./ClusteringManager.js";

export type GebetaMapRef = {
  addImageMarker: GebetaMaps["addImageMarker"];
  addMarker: GebetaMaps["addMarker"];
  clearMarkers: GebetaMaps["clearAllMarkers"];
  getMarkers: GebetaMaps["getMarkers"];
  getMapInstance: () => maplibregl.Map | null;
  // Fence management
  startFence: () => void;
  addFencePoint: GebetaMaps["addFencePoint"];
  closeFence: () => void;
  clearFence: () => void;
  clearAllFences: () => void;
  getFences: () => Fence[];
  getFencePoints: () => FencePoint[];
  isDrawingFence: () => boolean;
  addPath: GebetaMaps["addPath"];
  clearPaths: GebetaMaps["clearPaths"];
  addClusteredMarker: GebetaMaps["addClusteredMarker"];
  clearClusteredMarkers: GebetaMaps["clearClusteredMarkers"];
  updateClustering: GebetaMaps["updateClustering"];
  setClusteringEnabled: GebetaMaps["setClusteringEnabled"];
  setClusterImage: GebetaMaps["setClusterImage"];
  geocode: (...args: Parameters<GebetaMaps["geocode"]>) => Promise<any[]>;
  reverseGeocode: (...args: Parameters<GebetaMaps["reverseGeocode"]>) => Promise<any[]>;
  getDirections: (...args: Parameters<GebetaMaps["getDirections"]>) => Promise<any>;
  displayRoute: (...args: Parameters<GebetaMaps["displayRoute"]>) => void;
  clearRoute: () => void;
  getCurrentRoute: () => any;
  getRouteSummary: () => any;
  updateRouteStyle: (...args: Parameters<GebetaMaps["updateRouteStyle"]>) => void;
};

export interface GebetaMapProps {
  apiKey: string;
  center: [number, number];
  zoom: number;
  onMapClick?: (lngLat: [number, number], event: maplibregl.MapMouseEvent) => void;
  onMapLoaded?: () => void;
  blockInteractions?: boolean;
  style?: React.CSSProperties;
  clusteringOptions?: ClusteringOptions;
}

// Type for the marker object returned by addImageMarker
export type MarkerData = {
  marker: maplibregl.Marker;
  popup?: maplibregl.Popup;
};

// Error component for missing API key
const GebetaMapError: React.FC<{ message?: string }> = ({ message }) => (
  <div style={{
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8d7da",
    color: "#721c24",
    borderRadius: 12,
    fontWeight: 500,
    fontSize: 18,
    flexDirection: "column",
    gap: 8,
    border: "1px solid #f5c6cb"
  }}>
    <span>⚠️ GebetaMap SDK is not set up correctly.</span>
    <span>{message || "Please provide a valid Gebeta Maps API key."}</span>
  </div>
);

const GebetaMapImpl = forwardRef<GebetaMapRef, GebetaMapProps>(
  ({ apiKey, center, zoom, onMapClick, onMapLoaded, blockInteractions = false, style, clusteringOptions }, ref) => {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const gebetaMapsInstance = useRef<GebetaMaps | null>(null);

    // Memoize center and style props internally to ensure stability
    const stableCenter = useMemo(() => center, [JSON.stringify(center)]);
    const stableStyle = useMemo(() => style, [JSON.stringify(style || {})]);
    const stableOnMapLoaded = useMemo(() => onMapLoaded, []);
    const stableBlockInteractions = useMemo(() => blockInteractions, [blockInteractions]);

    useImperativeHandle(ref, () => ({
      addImageMarker: (...args) => gebetaMapsInstance.current!.addImageMarker(...args),
      addMarker: (...args) => gebetaMapsInstance.current!.addMarker(...args),
      clearMarkers: () => gebetaMapsInstance.current!.clearAllMarkers(),
      getMarkers: () => gebetaMapsInstance.current!.getMarkers(),
      getMapInstance: () => gebetaMapsInstance.current ? (gebetaMapsInstance.current as any).gebetaMaps : null,
      // Fence management
      startFence: () => gebetaMapsInstance.current!.startFence(),
      addFencePoint: (...args) => gebetaMapsInstance.current!.addFencePoint(...args),
      closeFence: () => gebetaMapsInstance.current!.closeFence(),
      clearFence: () => gebetaMapsInstance.current!.clearFence(),
      clearAllFences: () => gebetaMapsInstance.current!.clearAllFences(),
      getFences: () => gebetaMapsInstance.current!.getFences(),
      getFencePoints: () => gebetaMapsInstance.current!.getFencePoints(),
      isDrawingFence: () => gebetaMapsInstance.current!.isDrawingFence(),
      addPath: (...args) => gebetaMapsInstance.current!.addPath(...args),
      clearPaths: () => gebetaMapsInstance.current!.clearPaths(),
      addClusteredMarker: (...args) => gebetaMapsInstance.current!.addClusteredMarker(...args),
      clearClusteredMarkers: () => gebetaMapsInstance.current!.clearClusteredMarkers(),
      updateClustering: () => gebetaMapsInstance.current!.updateClustering(),
      setClusteringEnabled: (enabled) => gebetaMapsInstance.current!.setClusteringEnabled(enabled),
      setClusterImage: (imageUrl) => gebetaMapsInstance.current!.setClusterImage(imageUrl),
      geocode: (...args) => gebetaMapsInstance.current!.geocode(...args),
      reverseGeocode: (...args) => gebetaMapsInstance.current!.reverseGeocode(...args),
      getDirections: (...args) => gebetaMapsInstance.current!.getDirections(...args),
      displayRoute: (...args) => gebetaMapsInstance.current!.displayRoute(...args),
      clearRoute: () => gebetaMapsInstance.current!.clearRoute(),
      getCurrentRoute: () => gebetaMapsInstance.current!.getCurrentRoute(),
      getRouteSummary: () => gebetaMapsInstance.current!.getRouteSummary(),
      updateRouteStyle: (...args) => gebetaMapsInstance.current!.updateRouteStyle(...args),
    }), []);

    // Memoize the click handler so it doesn't trigger effect re-runs
    const stableOnMapClick = useMemo(() => onMapClick, []);

    useEffect(() => {
      if (!apiKey || apiKey.trim() === "") return;
      if (!mapContainer.current) return;
      if (gebetaMapsInstance.current) return;
      // Create GebetaMaps instance with transformRequest injected via options
      const gebetaMaps = new GebetaMaps({ apiKey }) as any;
      // Patch the init method to inject transformRequest
      const originalInit = gebetaMaps.init.bind(gebetaMaps);
      gebetaMaps.init = (options: any) => {
        const styleUrl = `https://tiles.gebeta.app/styles/standard/style.json`;
        const patchedOptions = {
          ...options,
          style: styleUrl,
          attributionControl: false,
          transformRequest: (url: string, resourceType: string) => {
            if (url.startsWith("https://tiles.gebeta.app")) {
              return {
                url,
                headers: {
                  Authorization: `Bearer ${apiKey}`,
                },
              };
            }
            return { url };
          },
        };
        return originalInit(patchedOptions);
      };
      gebetaMapsInstance.current = gebetaMaps;
      const map = gebetaMapsInstance.current.init({
        container: mapContainer.current,
        center: stableCenter,
        zoom,
        clusteringOptions,
      });
      gebetaMapsInstance.current.addNavigationControls();
      
      // Handle map loaded event
      if (stableOnMapLoaded) {
        map.on("load", () => {
          stableOnMapLoaded();
        });
      }
      
      // Handle interaction blocking
      if (stableBlockInteractions) {
        map.dragPan.disable();
        map.dragRotate.disable();
        map.scrollZoom.disable();
        map.keyboard.disable();
        map.doubleClickZoom.disable();
        map.touchZoomRotate.disable();
      }
      
      if (stableOnMapClick) {
        map.on("click", (e: any) => {
          const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];
          stableOnMapClick(lngLat, e);
        });
      }
      return () => {
        gebetaMapsInstance.current?.remove();
        gebetaMapsInstance.current = null;
      };
    }, [apiKey, stableCenter, zoom, stableOnMapClick, clusteringOptions, stableOnMapLoaded, stableBlockInteractions]);

    if (!apiKey || apiKey.trim() === "") {
      
      return <GebetaMapError message="GebetaMap SDK is not set. Please provide a valid API key." />;
    }

    return (
      <div
        ref={mapContainer}
        style={{ width: "100%", height: "100%", ...stableStyle }}
        data-testid="gebeta-map-container"
      />
    );
  }
);

const GebetaMap = React.memo(GebetaMapImpl);

export default GebetaMap;

// Re-export maplibregl types for library consumers
export type { Map as MapLibreMap, Marker, Popup, MapMouseEvent } from "maplibre-gl";
export type { Fence, FencePoint }; 