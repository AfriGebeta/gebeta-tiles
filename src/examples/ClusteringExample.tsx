import React, { useRef, useState } from "react";
import GebetaMap, { GebetaMapRef } from "src/lib/GebetaMap";
import type { ClusteredMarkerData } from "src/lib/ClusteringManager";

const randomLngLat = (): [number, number] => [
  38.76 + Math.random() * 0.03,
  9.01 + Math.random() * 0.03
];

const CLUSTER_MARKER_IMAGES = [
  "https://cdn-icons-png.flaticon.com/512/3081/3081559.png",
  "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  "https://cdn-icons-png.flaticon.com/512/252/252025.png",
  "https://cdn-icons-png.flaticon.com/512/854/854878.png",
  "https://cdn-icons-png.flaticon.com/512/616/616408.png"
];

const DEFAULT_CLUSTER_IMAGE = "https://cdn-icons-png.flaticon.com/512/616/616408.png";

// Static clustering options (do not change after mount)
const CLUSTERING_OPTIONS = {
  enabled: false,
  showClusterCount: true,
  clusterImage: DEFAULT_CLUSTER_IMAGE,
};

const ClusteringExample: React.FC = () => {
  const mapRef = useRef<GebetaMapRef>(null);
  const markerIdRef = useRef(0);
  const [clusteringEnabled, setClusteringEnabled] = useState(false);
  const [clusterImage, setClusterImage] = useState<string>(DEFAULT_CLUSTER_IMAGE);
  const normalMarkersRef = useRef<any[]>([]);
  // Track all marker data
  const allMarkersRef = useRef<ClusteredMarkerData[]>([]);

  // Add marker on map click
  const handleMapClick = (lngLat: [number, number]) => {
    addMarker(lngLat);
  };

  // Add marker in current mode and track data
  const addMarker = (lngLat?: [number, number]) => {
    if (!mapRef.current) return;
    const id = `marker-${markerIdRef.current++}`;
    const pos = lngLat || randomLngLat();
    const imageUrl = CLUSTER_MARKER_IMAGES[Math.floor(Math.random() * CLUSTER_MARKER_IMAGES.length)];
    const markerData: ClusteredMarkerData = {
      id,
      lngLat: pos,
      imageUrl,
      size: [36, 36],
      onClick: (lngLat, marker, e) => {
        e.preventDefault();
        alert(`${clusteringEnabled ? 'Clustered' : 'Normal'} marker at [${lngLat[0].toFixed(4)}, ${lngLat[1].toFixed(4)}] clicked!`);
      }
    };
    allMarkersRef.current.push(markerData);
    if (clusteringEnabled) {
      mapRef.current.addClusteredMarker(markerData);
    } else {
      const marker = mapRef.current.addMarker({
        element: (() => {
          const el = document.createElement('div');
          el.style.backgroundImage = `url('${imageUrl}')`;
          el.style.backgroundSize = 'contain';
          el.style.backgroundRepeat = 'no-repeat';
          el.style.width = '36px';
          el.style.height = '36px';
          el.style.cursor = 'pointer';
          return el;
        })()
      });
      marker.setLngLat(pos).addTo(mapRef.current.getMapInstance()!);
      marker.getElement().addEventListener('click', (e) => {
        e.preventDefault();
        alert(`Normal marker at [${pos[0].toFixed(4)}, ${pos[1].toFixed(4)}] clicked!`);
      });
      normalMarkersRef.current.push(marker);
    }
  };

  // Clear all markers
  const handleClear = () => {
    mapRef.current?.clearClusteredMarkers();
    markerIdRef.current = 0;
    // Remove normal markers
    normalMarkersRef.current.forEach(marker => marker.remove());
    normalMarkersRef.current = [];
    allMarkersRef.current = [];
  };

  // Toggle clustering and re-add all markers in the new mode
  const handleToggleClustering = () => {
    setClusteringEnabled((prev) => {
      const next = !prev;
      if (mapRef.current) {
        mapRef.current.setClusteringEnabled(next);
        // Remove all markers from the map
        mapRef.current.clearClusteredMarkers();
        normalMarkersRef.current.forEach(marker => marker.remove());
        normalMarkersRef.current = [];
        // Re-add all markers in the new mode
        allMarkersRef.current.forEach(markerData => {
          if (next) {
            mapRef.current!.addClusteredMarker(markerData);
          } else {
            const marker = mapRef.current!.addMarker({
              element: (() => {
                const el = document.createElement('div');
                el.style.backgroundImage = `url('${markerData.imageUrl}')`;
                el.style.backgroundSize = 'contain';
                el.style.backgroundRepeat = 'no-repeat';
                el.style.width = '36px';
                el.style.height = '36px';
                el.style.cursor = 'pointer';
                return el;
              })()
            });
            marker.setLngLat(markerData.lngLat).addTo(mapRef.current!.getMapInstance()!);
            marker.getElement().addEventListener('click', (e) => {
              e.preventDefault();
              alert(`Normal marker at [${markerData.lngLat[0].toFixed(4)}, ${markerData.lngLat[1].toFixed(4)}] clicked!`);
            });
            normalMarkersRef.current.push(marker);
          }
        });
      }
      return next;
    });
  };

  // Change cluster image and update clusters
  const handleClusterImageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setClusterImage(e.target.value);
    // If clustering is enabled, update clusters to use new image
    setTimeout(() => {
      if (mapRef.current && clusteringEnabled) {
        mapRef.current.setClusterImage(e.target.value);
        mapRef.current.updateClustering();
      }
    }, 0);
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", background: "#f8fafc" }}>
      {/* Overlay Toolbar */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          left: "20px",
          background: "#fff",
          boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
          borderRadius: 16,
          padding: 28,
          minWidth: 260,
          maxWidth: 340,
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 24,
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 22 }}>Marker Clustering Example</h2>
          <p style={{ color: '#555', margin: '8px 0 0 0', fontSize: 15 }}>
            Click on the map to add a marker.<br />
            Markers will cluster automatically as you zoom out if clustering is enabled.<br />
            Use the toggle to enable or disable clustering.<br />
            Click "Clear Markers" to remove all markers.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          <button
            onClick={handleToggleClustering}
            style={{
              background: clusteringEnabled ? '#2563eb' : '#e5e7eb',
              color: clusteringEnabled ? '#fff' : '#222',
              border: 'none',
              borderRadius: 6,
              padding: '8px 18px',
              fontWeight: 500,
              cursor: 'pointer',
              marginBottom: 6
            }}
          >
            {clusteringEnabled ? 'Clustering: ON' : 'Clustering: OFF'}
          </button>
          <button
            onClick={() => addMarker()}
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 18px',
              fontWeight: 500,
              cursor: 'pointer',
              marginBottom: 6
            }}
          >
            Add Random Marker
          </button>
          <button
            onClick={handleClear}
            style={{
              background: '#f87171',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 18px',
              fontWeight: 500,
              cursor: 'pointer',
              marginBottom: 6
            }}
          >
            Clear Markers
          </button>
          <label style={{ marginTop: 12, fontWeight: 500 }}>
            Cluster Image:
            <select
              value={clusterImage}
              onChange={handleClusterImageChange}
              style={{ marginLeft: 8, padding: 4, borderRadius: 4 }}
            >
              {CLUSTER_MARKER_IMAGES.map((img, i) => (
                <option key={img} value={img}>
                  {`Image ${i + 1}`}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      {/* Map */}
      <div style={{ width: "100%", height: "100%" }}>
        <GebetaMap
          ref={mapRef}
          apiKey={import.meta.env.VITE_GEBETA_MAPS_API_KEY}
          center={[38.7685, 9.0161]}
          zoom={14}
          onMapClick={handleMapClick}
          clusteringOptions={CLUSTERING_OPTIONS}
        />
      </div>
    </div>
  );
};

export default ClusteringExample; 