import React, { useRef, useState, useEffect } from "react";
import GebetaMap from "src/lib/GebetaMap";
import type { GebetaMapRef, MarkerData } from "src/lib/GebetaMap";

const CUSTOM_MARKER_IMAGES = [
  "https://cdn-icons-png.flaticon.com/512/3081/3081559.png",
  "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  "https://cdn-icons-png.flaticon.com/512/252/252025.png",
  "https://cdn-icons-png.flaticon.com/512/854/854878.png",
  "https://cdn-icons-png.flaticon.com/512/616/616408.png"
];

const DEFAULT_MARKER_IMAGE = "https://docs.maptiler.com/sdk-js/assets/marker.png";

const CustomMarkersExample: React.FC = () => {
  const mapRef = useRef<GebetaMapRef>(null);
  const [markerType, setMarkerType] = useState<'default' | 'custom'>('default');
  const markerTypeRef = useRef(markerType);
  useEffect(() => {
    markerTypeRef.current = markerType;
  }, [markerType]);

  // Always uses latest markerType via ref
  const handleMapClick = (lngLat: [number, number]) => {
    if (!mapRef.current) return;
    const mapInstance = mapRef.current.getMapInstance();
    if (!mapInstance) return;

    if (markerTypeRef.current === 'default') {
      const marker = mapRef.current.addMarker();
      if (marker) {
        marker.setLngLat(lngLat).addTo(mapInstance);
        marker.getElement().addEventListener('click', (e) => {
          e.preventDefault();
          console.log(`Default marker at [${lngLat[0].toFixed(4)}, ${lngLat[1].toFixed(4)}]`);
        });
      }
    } else {
      const randomImg = CUSTOM_MARKER_IMAGES[Math.floor(Math.random() * CUSTOM_MARKER_IMAGES.length)];
      mapRef.current.addImageMarker(
        lngLat,
        randomImg,
        [40, 40],
        (lngLat, marker, e) => {
          e.preventDefault();
          console.log(`Custom marker at [${lngLat[0].toFixed(4)}, ${lngLat[1].toFixed(4)}]`);
        },
        10,
        "<b>Custom Marker Popup</b>"
      );
    }
  };

  const handleClear = () => {
    mapRef.current?.clearMarkers();
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
          <h2 style={{ margin: 0, fontSize: 22 }}>Custom Markers Example</h2>
          <p style={{ color: '#555', margin: '8px 0 0 0', fontSize: 15 }}>
            Click anywhere on the map to add a marker.<br />
            Use the toggle to choose between a default marker and a random custom icon.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          <span style={{ fontWeight: 500, marginBottom: 4 }}>Marker type:</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setMarkerType('default')}
              style={{
                background: markerType === 'default' ? '#2563eb' : '#e5e7eb',
                color: markerType === 'default' ? '#fff' : '#222',
                border: 'none',
                borderRadius: 6,
                padding: '8px 18px',
                fontWeight: 500,
                cursor: 'pointer',
                marginRight: 4
              }}
            >
              Default
            </button>
            <button
              onClick={() => setMarkerType('custom')}
              style={{
                background: markerType === 'custom' ? '#2563eb' : '#e5e7eb',
                color: markerType === 'custom' ? '#fff' : '#222',
                border: 'none',
                borderRadius: 6,
                padding: '8px 18px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Custom
            </button>
          </div>
        </div>
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
            marginTop: 8,
            alignSelf: 'flex-start'
          }}
        >
          Clear Markers
        </button>
      </div>
      {/* Map */}
      <div style={{ width: "100%", height: "100%" }}>
        <GebetaMap
          ref={mapRef}
          apiKey={import.meta.env.VITE_GEBETA_MAPS_API_KEY}
          center={[38.7685, 9.0161]}
          zoom={15}
          onMapClick={handleMapClick}
        />
      </div>
    </div>
  );
};

export default CustomMarkersExample; 