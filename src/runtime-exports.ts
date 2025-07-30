// Runtime exports for types that need to be available at runtime
// This ensures compatibility with bundlers that expect named exports

// Re-export the main component
export { default as GebetaMap } from "./lib/GebetaMap.js";
export { default } from "./lib/GebetaMap.js";

// Export types as runtime values (they will be undefined at runtime but available for type checking)
export const GebetaMapRef = undefined as any;
export const Fence = undefined as any;
export const GebetaMapProps = undefined as any;
export const MarkerData = undefined as any;
export const FencePoint = undefined as any;
export const ClusteringOptions = undefined as any; 