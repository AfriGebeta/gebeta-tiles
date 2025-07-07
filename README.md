# Gebeta Maps React SDK

A modern React SDK for integrating Gebeta Maps into your applications.  
Provides a declarative `<GebetaMap />` component, advanced marker management, and a clean, extensible API.

---

## Features

- React component for embedding Gebeta Maps
- Add default and custom image markers
- Marker management (add, remove, clear, batch)
- Popups, z-index, and click handlers for markers
- Example gallery and usage patterns

---

## Installation

```bash
yarn add @gebeta/tiles/react
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
import GebetaMap from "@gebeta/tiles/react/lib/GebetaMap";

const MyMap = () => {
  const mapRef = useRef(null);

  const handleMapClick = (lngLat) => {
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

---

## Advanced Marker Management

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

---

## API Reference

### `<GebetaMap />` Props

| Prop         | Type                                   | Description                                 |
|--------------|----------------------------------------|---------------------------------------------|
| `apiKey`     | `string`                               | **Required.** Your Gebeta Maps API key.     |
| `center`     | `[number, number]`                     | Initial map center `[lng, lat]`.            |
| `zoom`       | `number`                               | Initial zoom level.                         |
| `onMapClick` | `(lngLat, event) => void`              | Callback for map click events.              |
| `style`      | `object`                               | Optional. Custom styles for the container.  |

### Ref Methods

- `addMarker(options?)`: Returns a default marker instance (call `.setLngLat` and `.addTo(map)`).
- `addImageMarker(lngLat, imageUrl, size?, onClick?, zIndex?, popupHtml?)`: Adds a custom image marker.
- `clearMarkers()`: Removes all markers from the map.
- `getMarkers()`: Returns all current marker instances.
- `getMapInstance()`: Returns the underlying map instance.

---

## Example

See [`src/examples/CustomMarkersExample.tsx`](src/examples/CustomMarkersExample.tsx) for a full-featured example, including a UI for toggling marker types and clearing markers.
