# Gebeta Map Example

This example demonstrates the usage of the Gebeta Map library with all its features:
- Basic markers with custom colors
- Polylines with customizable styles
- Polygons with fill and stroke options
- Marker clustering with custom appearance
- Interactive marker selection
- Click handling for map and markers

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/gebeta-map.git
cd gebeta-map
```

2. Install dependencies in the root directory:
```bash
yarn install
```

3. Build the library:
```bash
yarn build
```

4. Navigate to the example directory:
```bash
cd examples/basic
```

5. Install example dependencies:
```bash
yarn install
```

6. Create a `.env.local` file with your Gebeta API key:
```bash
cp .env.example .env.local
```
Then edit `.env.local` and replace `your_api_key_here` with your actual Gebeta API key.

## Running the Example

Start the development server:
```bash
yarn dev
```

The example will be available at [http://localhost:3000](http://localhost:3000).

## Code Structure

- `src/App.tsx`: Main component showcasing all features
- `src/App.css`: Styles for the example
- `src/main.tsx`: Application entry point
- `src/env.d.ts`: TypeScript declarations for environment variables

## Features Demonstrated

### Basic Markers
```tsx
<MapMarker
  lngLat={[38.7578, 8.9806]}
  color="#FF0000"
  onClick={() => {}}
  isSelected={false}
/>
```

### Polylines
```tsx
<MapPolyline
  coordinates={[[38.7578, 8.9806], [38.7600, 8.9850]]}
  color="#FF0000"
  width={3}
/>
```

### Polygons
```tsx
<MapPolygon
  coordinates={[[38.7578, 8.9806], [38.7600, 8.9850], [38.7550, 8.9830]]}
  fillColor="rgba(255, 0, 0, 0.2)"
  strokeColor="#FF0000"
  strokeWidth={2}
/>
```

### Marker Clustering
```tsx
<MapCluster config={{ radius: 50, maxZoom: 14, minPoints: 2 }}>
  <MapMarker lngLat={[38.7578, 8.9806]} />
  <MapMarker lngLat={[38.7600, 8.9850]} />
</MapCluster>
```

## License

MIT 