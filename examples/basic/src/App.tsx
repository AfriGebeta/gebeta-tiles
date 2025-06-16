import React, { useState, useRef, useMemo, useCallback } from 'react';
import { GebetaMap, MapMarker, MapPolyline, MapPolyfill, MapCluster, Map } from '@gebeta/tiles';
import './App.css';
// import modern from '..//modern_theme.json';

// Example marker images (replace with actual image URLs in your application)
const MARKER_IMAGES = {
  RESTAURANT: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  HOTEL: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  SHOP: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png'
};

const App: React.FC = () => {
  const mapRef = useRef<Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isClustering, setIsClustering] = useState(true);
  const [dynamicMarkers, setDynamicMarkers] = useState<Array<{
    id: string;
    lngLat: [number, number];
    color: string;
  }>>([]);

  // Example data - memoize static data
  const staticMarkers = useMemo(() => [
    // Regular markers
    {
      id: '1',
      lngLat: [38.7578, 8.9806] as [number, number],
      color: '#FF0000'
    },
    {
      id: '2',
      lngLat: [38.7600, 8.9850] as [number, number],
      color: '#00FF00'
    },
    // Image markers
    {
      id: '3',
      lngLat: [38.7550, 8.9830] as [number, number],
      image: MARKER_IMAGES.RESTAURANT,
      imageSize: { width: 25, height: 41 }  // Standard marker icon size
    },
    {
      id: '4',
      lngLat: [38.7590, 8.9820] as [number, number],
      image: MARKER_IMAGES.HOTEL,
      imageSize: { width: 25, height: 41 }
    },
    {
      id: '5',
      lngLat: [38.7570, 8.9840] as [number, number],
      image: MARKER_IMAGES.SHOP,
      imageSize: { width: 25, height: 41 }
    }
  ], []);

  // Combine static and dynamic markers
  const markers = useMemo(() => [...staticMarkers, ...dynamicMarkers], [staticMarkers, dynamicMarkers]);

  const polyline = useMemo(() => ({
    id: 'example-polyline',
    coordinates: [
      [38.7578, 8.9806],
      [38.7600, 8.9850],
      [38.7550, 8.9830]
    ] as [number, number][],
    color: '#FF0000',
    width: 3
  }), []);

  const polyfill = useMemo(() => ({
    id: 'example-polyfill',
    coordinates: [
      // Create a rectangle around the center point [38.7578, 8.9806]
      [38.7778, 8.9706],  // Southwest
      [38.7778, 8.9906],  // Northwest
      [38.7978, 8.9906],  // Northeast
      [38.7978, 8.9706],  // Southeast
      [38.7778, 8.9706],  // Back to Southwest to close the polygon
    ] as [number, number][],
    fillColor: 'rgba(255, 0, 0, 0.5)',  // Red with 50% opacity
    outlineColor: '#000000', // Black outline
    outlineWidth: 3,
    fillOpacity: 1 // Using opacity in fillColor instead
  }), []);

  const clusterConfig = useMemo(() => ({
    radius: 50,
    maxZoom: 14,
    minPoints: 2,
    color: '#FF0000',
    textColor: '#FFFFFF'
  }), []);

  const handleMarkerClick = useCallback((markerId: string) => {
    /* you can use markerId to update the marker or add a popup */
    console.log('Marker clicked:', markerId);
  }, []);

  const handleMapLoad = useCallback((mapInstance: Map) => {
    /* you can use the mapInstance returned from the onMapLoad callback to add custom map controls */
    mapRef.current = mapInstance;
    setMapLoaded(true);
    mapInstance.flyTo({
      center: [38.7578, 8.9806] as [number, number],
      zoom: 12
    });
  }, []);

  const handleMapClick = useCallback((event: { lngLat: [number, number] }) => {
    const newMarker = {
      id: `dynamic-${Date.now()}`,
      lngLat: event.lngLat,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}` // Random color
    };
    setDynamicMarkers(prev => [...prev, newMarker]);
  }, []);

  /* You should memoize the cluster markers with click handlers */
  const clusterMarkers = useMemo(() =>
      markers.map(marker => ({
        ...marker,
        onClick: () => handleMarkerClick(marker.id)
      })), [markers, handleMarkerClick]);

  /* An example usecase of how to use onClusterClick */
  const handleClusterClick = useCallback((clusterId: number, coordinates: [number, number]) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: coordinates,
        zoom: clusterConfig.maxZoom
      });
    }
  }, [clusterConfig.maxZoom]);

  return (
    <div className="app" data-testid="app-container">
      <GebetaMap
        /* THIS IS REQUIRED, without the api key the tiles wont render. Please add an api key in a .env file */
        apiKey={import.meta.env.VITE_GEBETA_API_KEY || ''}
        center={[38.7578, 8.9806] as [number, number]}
        zoom={12}
        // style="modern" // uncomment this to see an example of a custom theme file
        onMapLoad={handleMapLoad}
        mapRef={mapRef}
        data-testid="gebeta-map"
        className="gebeta-map-container"
        onMapClick={handleMapClick}
      >
        {mapLoaded && (
          <>
            {isClustering ? (
              /* You can wrap the markers in a MapCluster component to enable clustering */
              <MapCluster
                markers={clusterMarkers}
                config={clusterConfig}
                data-testid="map-cluster"
                onClusterClick={handleClusterClick}
              />
            ) : (
              <div data-testid="markers-container">
                {markers.map(marker => (
                  <MapMarker
                    key={marker.id}
                    {...marker}
                    onClick={() => handleMarkerClick(marker.id)}
                    data-testid={`marker-${marker.id}`}
                  />
                ))}
              </div>
            )}

                <MapPolyline
                    {...polyline}
                    data-testid="map-polyline"
                />

                <MapPolyfill
                    {...polyfill}
                    data-testid="map-polyfill"
                />
              </>
          )}
        </GebetaMap>

        <div className="features" data-testid="features-panel">
          <h2>Gebeta Map Features</h2>
          <ul>
            <li>Basic markers with custom colors</li>
            <li>Image markers with custom icons</li>
            <li>Polylines with customizable styles</li>
            <li>Polyfills with fill and outline options</li>
            <li>Marker clustering with custom appearance</li>
            <li>Interactive marker selection</li>
            <li>Click handling for map and markers</li>
            <li>Click to add markers with random colors</li>
          </ul>
          <button onClick={() => setIsClustering(!isClustering)}>
            {isClustering ? 'Disable Clustering' : 'Enable Clustering'}
          </button>
        </div>
      </div>
  );
};

export default App; 