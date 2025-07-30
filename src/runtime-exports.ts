// Runtime exports for types that need to be available at runtime
// This ensures compatibility with bundlers that expect named exports

// Re-export the main component
export { default as GebetaMap } from "./lib/GebetaMap.js";
export { default } from "./lib/GebetaMap.js";

// Re-export types properly - these will be available as types for TypeScript
export type { GebetaMapRef, GebetaMapProps, MarkerData } from "./lib/GebetaMap.js";
export type { Fence, FencePoint } from "./lib/FenceManager.js";
export type { ClusteringOptions } from "./lib/ClusteringManager.js";

// Re-export maplibre-gl types for convenience
export type { Map as MapLibreMap, Marker, Popup, MapMouseEvent } from "maplibre-gl"; 