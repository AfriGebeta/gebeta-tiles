// Re-export everything from the main component
export { default as GebetaMap, type GebetaMapRef, type GebetaMapProps, type MarkerData } from "./lib/GebetaMap";

// Re-export fence types
export type { Fence, FencePoint } from "./lib/FenceManager";

// Re-export clustering types
export type { ClusteringOptions } from "./lib/ClusteringManager";

// Re-export maplibre-gl types for convenience
export type { Map as MapLibreMap, Marker, Popup, MapMouseEvent } from "maplibre-gl";

// Default export
export { default } from "./lib/GebetaMap"; 