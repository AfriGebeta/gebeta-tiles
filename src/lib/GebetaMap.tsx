import React, { useEffect, useRef, useImperativeHandle, forwardRef, useMemo } from "react";
import { GebetaMaps } from "src/lib/GebetaMaps";
import type * as maplibregl from "maplibre-gl";
import type { Fence, FencePoint } from "src/lib/FenceManager";

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
};

export interface GebetaMapProps {
  apiKey: string;
  center: [number, number];
  zoom: number;
  onMapClick?: (lngLat: [number, number], event: maplibregl.MapMouseEvent) => void;
  style?: React.CSSProperties;
}

// Type for the marker object returned by addImageMarker
export type MarkerData = {
  marker: maplibregl.Marker;
  popup?: maplibregl.Popup;
};

const GebetaMap = forwardRef<GebetaMapRef, GebetaMapProps>(
  ({ apiKey, center, zoom, onMapClick, style }, ref) => {
    console.log('GebetaMap rendered');
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const gebetaMapsInstance = useRef<GebetaMaps | null>(null);

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
    }), []);

    // Memoize the click handler so it doesn't trigger effect re-runs
    const stableOnMapClick = useMemo(() => onMapClick, []);

    useEffect(() => {
      if (!apiKey || apiKey.trim() === "") return;
      if (!mapContainer.current) return;
      if (gebetaMapsInstance.current) return;
      gebetaMapsInstance.current = new GebetaMaps({ apiKey });
      const map = gebetaMapsInstance.current.init({
        container: mapContainer.current,
        center,
        zoom,
      });
      gebetaMapsInstance.current.addNavigationControls();
      if (stableOnMapClick) {
        map.on("click", (e: maplibregl.MapMouseEvent) => {
          const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];
          stableOnMapClick(lngLat, e);
        });
      }
      return () => {
        gebetaMapsInstance.current?.remove();
        gebetaMapsInstance.current = null;
      };
    }, [apiKey, center, zoom, stableOnMapClick]);

    if (!apiKey || apiKey.trim() === "") {
      return (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8d7da", color: "#721c24", borderRadius: 12, fontWeight: 500, fontSize: 18 }}>
          Please provide a valid Gebeta Maps API key.
        </div>
      );
    }

    return (
      <div
        ref={mapContainer}
        style={{ width: "100%", height: "100%", ...style }}
        data-testid="gebeta-map-container"
      />
    );
  }
);

export default GebetaMap;

// Re-export maplibregl types for library consumers
export type { Map as MapLibreMap, Marker, Popup, MapMouseEvent } from "maplibre-gl";
export type { Fence, FencePoint }; 