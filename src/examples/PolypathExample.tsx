import React, { useRef } from "react";
import GebetaMap, { GebetaMapRef } from "src/lib/GebetaMap";

const markerIcon = (color: string) => {
  const el = document.createElement('div');
  el.style.background = color;
  el.style.borderRadius = '50%';
  el.style.width = '24px';
  el.style.height = '24px';
  el.style.border = '2px solid #fff';
  el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.15)';
  return el;
};

const PolypathExample: React.FC = () => {
  const mapRef = useRef<GebetaMapRef>(null);
  const startPointRef = useRef<[number, number] | null>(null);
  const endPointRef = useRef<[number, number] | null>(null);
  const startMarkerRef = useRef<any>(null);
  const endMarkerRef = useRef<any>(null);

  // Handle map click: set start, then end, then draw path
  const handleMapClick = (lngLat: [number, number]) => {
    if (!startPointRef.current) {
      startPointRef.current = lngLat;
      // Add start marker
      if (mapRef.current) {
        if (startMarkerRef.current) startMarkerRef.current.remove();
        const marker = mapRef.current.addMarker({ element: markerIcon('#22c55e') });
        marker.setLngLat(lngLat).addTo(mapRef.current.getMapInstance()!);
        startMarkerRef.current = marker;
      }
    } else if (!endPointRef.current) {
      endPointRef.current = lngLat;
      // Add end marker
      if (mapRef.current) {
        if (endMarkerRef.current) endMarkerRef.current.remove();
        const marker = mapRef.current.addMarker({ element: markerIcon('#ef4444') });
        marker.setLngLat(lngLat).addTo(mapRef.current.getMapInstance()!);
        endMarkerRef.current = marker;
      }
      // Draw path
      if (mapRef.current && startPointRef.current) {
        mapRef.current.addPath([startPointRef.current, lngLat], {
          color: "#2563eb",
          width: 5,
          opacity: 0.85,
        });
      }
    }
  };

  // Clear everything
  const handleClear = () => {
    startPointRef.current = null;
    endPointRef.current = null;
    if (mapRef.current) {
      mapRef.current.clearPaths();
      if (startMarkerRef.current) startMarkerRef.current.remove();
      if (endMarkerRef.current) endMarkerRef.current.remove();
    }
    startMarkerRef.current = null;
    endMarkerRef.current = null;
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
          <h2 style={{ margin: 0, fontSize: 22 }}>Polypath Example</h2>
          <p style={{ color: '#555', margin: '8px 0 0 0', fontSize: 15 }}>
            Click on the map to set the <span style={{ color: '#22c55e', fontWeight: 500 }}>start</span> point, then the <span style={{ color: '#ef4444', fontWeight: 500 }}>end</span> point.<br />
            A path will be drawn between them. Click "Clear" to reset.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
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
            Clear
          </button>
        </div>
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

export default PolypathExample; 