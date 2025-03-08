# Gebeta Maps React

A professional React wrapper for Gebeta Maps, providing a comprehensive interface for creating interactive maps with markers, polylines, polygons, and clustering capabilities.

## Features

- Multiple built-in map styles
- Customizable markers (both color and image-based)
- Polylines with custom styling
- Polyfill support with fill and outline options
- Marker clustering with customizable appearance
- Interactive markers with click handling
- Map click event handling
- TypeScript support

## Installation

```bash
npm install @gebeta/tiles
# or
yarn add @gebeta/tiles
```

## Prerequisites

- A Gebeta Maps API key (get yours by registering at [Gebeta Maps](https://gebeta.app/))

## Quick Start

```jsx
import { GebetaMap, MapMarker } from '@gebeta/tiles';

function MyMap() {
  return (
    <GebetaMap
      apiKey="YOUR_API_KEY"
      center={[38.7578, 8.9806]}
      zoom={12}
      style="gebeta_basic"
    >
      <MapMarker
        id="marker-1"
        lngLat={[38.7578, 8.9806]}
        color="#FF0000"
        onClick={() => console.log('Marker clicked!')}
      />
    </GebetaMap>
  );
}
```

## API Reference

### Components

#### GebetaMap

The main map component that serves as a container for all other components.

```tsx
import { GebetaMap } from '@gebeta/tiles';

<GebetaMap
  apiKey="YOUR_API_KEY"          // Required: Your Gebeta Maps API key
  center={[longitude, latitude]} // Required: Initial center position
  zoom={12}                     // Required: Initial zoom level
  style="gebeta_basic"          // Optional: Map style ('basic', 'gebeta_basic', 'modern', or custom style object)
  onMapLoad={(map) => {}}       // Optional: Called when map loads
  onMapClick={(event) => {}}    // Optional: Called when map is clicked
  className="custom-class"      // Optional: CSS class for the container
  mapRef={mapRef}              // Optional: Ref to access the map instance
>
  {/* Child components */}
</GebetaMap>
```

#### MapMarker

Component for adding markers to the map. Supports both color-based and image-based markers.

```tsx
import { MapMarker } from '@gebeta/tiles';

// Color-based marker
<MapMarker
  id="marker-1"                // Required: Unique identifier
  lngLat={[longitude, latitude]} // Required: Marker position
  color="#FF0000"              // Optional: Marker color (default: '#FF0000')
  isSelected={false}           // Optional: Selection state
  onClick={() => {}}           // Optional: Click handler
/>

// Image-based marker
<MapMarker
  id="marker-2"
  lngLat={[longitude, latitude]}
  image="path/to/image.png"    // URL of the marker image
  imageSize={{                 // Optional: Image size
    width: 32,
    height: 32
  }}
  onClick={() => {}}
/>
```

#### MapPolyline

Component for drawing lines on the map.

```tsx
import { MapPolyline } from '@gebeta/tiles';

<MapPolyline
  id="polyline-1"              // Required: Unique identifier
  coordinates={[               // Required: Array of coordinates
    [longitude1, latitude1],
    [longitude2, latitude2]
  ]}
  color="#FF0000"             // Optional: Line color
  width={2}                   // Optional: Line width
/>
```

#### MapPolyfill

Component for drawing filled polygons on the map.

```tsx
import { MapPolyfill } from '@gebeta/tiles';

<MapPolyfill
  id="polygon-1"               // Required: Unique identifier
  coordinates={[               // Required: Array of coordinates forming a polygon
    [longitude1, latitude1],
    [longitude2, latitude2],
    // Note: Polygon must be closed (first and last coordinates must be identical)
  ]}
  fillColor="rgba(255,0,0,0.5)" // Optional: Fill color with opacity
  outlineColor="#000000"        // Optional: Outline color
  outlineWidth={2}              // Optional: Outline width
/>
```

#### MapCluster

Component for clustering markers.

```tsx
import { MapCluster } from '@gebeta/tiles';

<MapCluster
  markers={[                   // Required: Array of marker configurations
    {
      id: "1",
      lngLat: [longitude, latitude]
    }
  ]}
  config={{                    // Optional: Clustering configuration
    radius: 50,               // Cluster radius
    maxZoom: 14,             // Maximum zoom level for clustering
    minPoints: 2,            // Minimum points to form a cluster
    color: "#FF0000",        // Cluster color
    textColor: "#FFFFFF"     // Cluster text color
  }}
  onClusterClick={(clusterId, coordinates) => {}}
/>
```

### Map Styles

Available built-in styles:
- `basic`: A clean, minimal style
- `gebeta_basic`: Gebeta's default style
- `modern`: A modern, detailed style

Custom styles can be provided as a style specification object following the Gebeta Maps style format.
> `beta` you can generate your own custom style specification [here](https://playground.tiles.gebeta.app/)

### TypeScript Support

The package includes comprehensive TypeScript definitions:

```typescript
interface MapConfig {
  apiKey: string;
  center: [number, number];
  zoom: number;
  style?: GebetaMapStyle;
}

interface MarkerConfig {
  id: string;
  lngLat: [number, number];
  color?: string;
  image?: string;
  imageSize?: ImageSize;
}

// Additional type definitions available in types/index.ts
```

## Examples

For complete implementation examples, refer to the [examples/basic](examples/basic) directory in the repository

## Contributing

We welcome contributions. Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For technical support:
- [Open an issue](https://github.com/AfriGebeta/gebeta-tiles/issues) on GitHub
- Contact us through our website
