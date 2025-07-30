# Gebeta Maps React SDK

A modern React SDK for integrating Gebeta Maps into your applications.  
Provides a declarative `<GebetaMap />` component, advanced marker management, fence drawing, clustering, and a clean, extensible API.

---

## Features

- React component for embedding Gebeta Maps
- Add default and custom image markers
- Marker management (add, remove, clear, batch)
- Popups, z-index, and click handlers for markers
- Fence drawing and management
- Marker clustering
- Geocoding and reverse geocoding
- Directions and routing
- Example gallery and usage patterns

---

## Installation

```bash
yarn add @gebeta/tiles
```

---

## Quick Start

### 1. Add your API key

Create a `.env` file in your project root:
```
VITE_GEBETA_MAPS_API_KEY=your_gebeta_maps_api_key
```

### 2. Use the `<GebetaMap />` component

```jsx
import React, { useRef } from "react";
import GebetaMap, { GebetaMapRef } from "@gebeta/tiles";

const MyMap = () => {
  const mapRef = useRef<GebetaMapRef>(null);

  const handleMapClick = (lngLat: [number, number]) => {
    // Add a default marker
    const marker = mapRef.current?.addMarker();
    const mapInstance = mapRef.current?.getMapInstance();
    if (marker && mapInstance) {
      marker.setLngLat(lngLat).addTo(mapInstance);
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <GebetaMap
        ref={mapRef}
        apiKey={import.meta.env.VITE_GEBETA_MAPS_API_KEY}
        center={[38.7685, 9.0161]}
        zoom={15}
        onMapClick={handleMapClick}
      />
    </div>
  );
};
```

**Note for TypeScript strict mode**: If you're using `verbatimModuleSyntax` or strict TypeScript settings, you may need to import types separately:

```jsx
import GebetaMap from "@gebeta/tiles";
import type { GebetaMapRef } from "@gebeta/tiles";
```

---

## Advanced Features

### Marker Management

You can add custom image markers, popups, and more:

```jsx
// Add a custom image marker
mapRef.current?.addImageMarker(
  [38.7685, 9.0161],
  "https://cdn-icons-png.flaticon.com/512/3081/3081559.png",
  [40, 40],
  () => alert("Marker clicked!"),
  10,
  "<b>Custom Marker Popup</b>"
);

// Remove all markers
mapRef.current?.clearMarkers();
```

### Fence Drawing

Draw fences by clicking on the map:

```jsx
const handleMapClick = (lngLat: [number, number]) => {
  if (!mapRef.current) return;
  mapRef.current.addFencePoint(lngLat);
};

// Clear the current fence
mapRef.current?.clearFence();

// Get all fences
const fences = mapRef.current?.getFences();
```

### Marker Clustering

Enable clustering for better performance with many markers:

```jsx
<GebetaMap
  ref={mapRef}
  apiKey={import.meta.env.VITE_GEBETA_MAPS_API_KEY}
  center={[38.7685, 9.0161]}
  zoom={15}
  clusteringOptions={{
    enabled: true,
    maxZoom: 16,
    radius: 50
  }}
/>
```

### Geocoding

Search for locations and get coordinates:

```jsx
// Search for a location
const results = await mapRef.current?.geocode("Addis Ababa");

// Reverse geocoding
const address = await mapRef.current?.reverseGeocode(38.7685, 9.0161);
```

### Directions

Get and display routes:

```jsx
// Get directions
const route = await mapRef.current?.getDirections(
  { lat: 38.7685, lng: 9.0161 },
  { lat: 38.7595, lng: 9.0061 }
);

// Display the route
mapRef.current?.displayRoute(route);
```

---

## API Reference

### `<GebetaMap />` Props

| Prop                | Type                                   | Description                                 |
|---------------------|----------------------------------------|---------------------------------------------|
| `apiKey`            | `string`                               | **Required.** Your Gebeta Maps API key.     |
| `center`            | `[number, number]`                     | Initial map center `[lng, lat]`.            |
| `zoom`              | `number`                               | Initial zoom level.                         |
| `onMapClick`        | `(lngLat, event) => void`              | Callback for map click events.              |
| `style`             | `React.CSSProperties`                  | Optional. Custom styles for the container.  |
| `clusteringOptions` | `ClusteringOptions`                    | Optional. Marker clustering configuration.   |

### Ref Methods

#### Marker Management
- `addMarker(options?)`: Returns a default marker instance (call `.setLngLat` and `.addTo(map)`).
- `addImageMarker(lngLat, imageUrl, size?, onClick?, zIndex?, popupHtml?)`: Adds a custom image marker.
- `clearMarkers()`: Removes all markers from the map.
- `getMarkers()`: Returns all current marker instances.

#### Fence Management
- `startFence()`: Start drawing a new fence.
- `addFencePoint(lngLat)`: Add a point to the current fence.
- `closeFence()`: Close the current fence.
- `clearFence()`: Clear the current fence.
- `clearAllFences()`: Clear all fences.
- `getFences()`: Returns all fence instances.
- `getFencePoints()`: Returns all fence points.
- `isDrawingFence()`: Returns true if currently drawing a fence.

#### Clustering
- `addClusteredMarker(markerData)`: Add a marker to clustering.
- `clearClusteredMarkers()`: Clear all clustered markers.
- `updateClustering()`: Manually update clustering.
- `setClusteringEnabled(enabled)`: Enable/disable clustering.
- `setClusterImage(imageUrl)`: Set custom cluster image.

#### Geocoding
- `geocode(query)`: Search for locations.
- `reverseGeocode(lat, lng)`: Get address from coordinates.

#### Directions
- `getDirections(origin, destination, options?)`: Get route between points.
- `displayRoute(routeData, options?)`: Display a route on the map.
- `clearRoute()`: Clear the current route.
- `getCurrentRoute()`: Get the current route data.
- `getRouteSummary()`: Get route summary information.
- `updateRouteStyle(style)`: Update route appearance.

#### Utility
- `getMapInstance()`: Returns the underlying map instance.

### Types

```typescript
import { GebetaMapRef, Fence, GebetaMapProps, MarkerData, FencePoint, ClusteringOptions } from '@gebeta/tiles';
```

**For TypeScript strict mode:**
```typescript
import GebetaMap from '@gebeta/tiles';
import type { GebetaMapRef, Fence, GebetaMapProps, MarkerData, FencePoint, ClusteringOptions } from '@gebeta/tiles';
```

---

## Examples

See the `src/examples/` directory for full-featured examples:

- [`FenceExample.tsx`](src/examples/FenceExample.tsx) - Fence drawing functionality
- [`CustomMarkersExample.tsx`](src/examples/CustomMarkersExample.tsx) - Advanced marker management
- [`ClusteringExample.tsx`](src/examples/ClusteringExample.tsx) - Marker clustering
- [`DirectionsExample.tsx`](src/examples/DirectionsExample.tsx) - Routing and directions
