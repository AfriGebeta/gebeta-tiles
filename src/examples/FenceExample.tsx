import React, { useEffect, useRef, useState } from "react";
import GebetaMap from "src/lib/GebetaMap";
import type { GebetaMapRef, Fence } from "src/lib/GebetaMap";

const FenceExample: React.FC = () => {
  const mapRef = useRef<GebetaMapRef>(null);
  const [_fences, setFences] = useState<Fence[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [blockInteractions, setBlockInteractions] = useState(false);

  // Always call addFencePoint; FenceManager will handle start/close logic
  const handleMapClick = (lngLat: [number, number]) => {
    if (!mapRef.current) return;
    mapRef.current.addFencePoint(lngLat);
  };

  // Clear the current fence
  const handleClearFence = () => {
    mapRef.current?.clearFence();
    setFences(mapRef.current?.getFences() || []);
  };

  const handleMapLoaded = () => {
    setIsMapLoaded(true);
    console.log("🎉 Map has finished loading!");
  };
  
  useEffect(() => {
    if(!mapRef.current) return;
    const mapInstance = mapRef.current.getMapInstance();
    mapInstance.on('zoomend' , ()=>{
      const bounds = mapInstance.getBounds();
      const zoom = mapInstance.getZoom()
      const center = mapInstance.getCenter();
      console.log(`Zoom level: ${zoom}`);
      console.log(`Center: [${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}]`);
      console.log('Bounds:', {
        ne: [bounds.getNorthEast().lat.toFixed(4), bounds.getNorthEast().lng.toFixed(4)],
        sw: [bounds.getSouthWest().lat.toFixed(4), bounds.getSouthWest().lng.toFixed(4)]
      });
    })
  
    mapInstance.on('movestart', () => {
      console.log("move started");
    });
  
    mapInstance.on('moveend', () => {
      console.log("move end")
    });
    
    mapInstance.on('move', () => {
        console.log('Map is being panned...');
    });
  }, [mapRef.current])

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
          <h2 style={{ margin: 0, fontSize: 22 }}>Fence Drawing Example</h2>
          <p style={{ color: '#555', margin: '8px 0 0 0', fontSize: 15 }}>
            Click on the map to start drawing a fence.<br />
            Continue clicking to add points. Click the first point again to close the fence.<br />
            You can clear the current or all fences below.
          </p>
        </div>

        {/* Map Loading Status */}
        <div style={{ 
          padding: '12px 16px', 
          background: isMapLoaded ? '#d4edda' : '#fff3cd', 
          borderRadius: 8,
          border: `1px solid ${isMapLoaded ? '#c3e6cb' : '#ffeaa7'}`,
          color: isMapLoaded ? '#155724' : '#856404'
        }}>
          <strong>Map Status:</strong> {isMapLoaded ? '✅ Loaded' : '⏳ Loading...'}
        </div>

        {/* Interaction Toggle */}
        <div style={{ 
          padding: '12px 16px', 
          background: blockInteractions ? '#f8d7da' : '#d1ecf1', 
          borderRadius: 8,
          border: `1px solid ${blockInteractions ? '#f5c6cb' : '#bee5eb'}`,
          color: blockInteractions ? '#721c24' : '#0c5460'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <strong>Interactions:</strong>
            <button
              onClick={() => setBlockInteractions(!blockInteractions)}
              style={{
                background: blockInteractions ? '#dc3545' : '#28a745',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '4px 12px',
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              {blockInteractions ? 'BLOCKED' : 'ENABLED'}
            </button>
          </div>
          <small>
            {blockInteractions 
              ? 'All map interactions are disabled (pan, zoom, etc.)' 
              : 'Map interactions are enabled'
            }
          </small>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          <button
            onClick={handleClearFence}
            style={{
              background: '#fbbf24',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 18px',
              fontWeight: 500,
              cursor: 'pointer',
              marginBottom: 6
            }}
          >
            Clear Fence
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
          onMapLoaded={handleMapLoaded}
          blockInteractions={blockInteractions}
        />
      </div>
    </div>
  );
};

export default FenceExample; 