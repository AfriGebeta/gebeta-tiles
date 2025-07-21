import React, { useRef, useState } from "react";
import GebetaMap, { GebetaMapRef } from "src/lib/GebetaMap";

// Helper to extract [lng, lat] from any object
function getLatLng(item: any): [number, number] | null {
  const lat = Number(item.lat ?? item.latitude);
  const lng = Number(item.lon ?? item.lng ?? item.longitude);
  if (isNaN(lat) || isNaN(lng)) return null;
  return [lng, lat];
}

const MARKER_ICON_ORIGIN = "https://cdn-icons-png.flaticon.com/512/1828/1828640.png";
const MARKER_ICON_DEST = "https://cdn-icons-png.flaticon.com/512/3081/3081559.png";

const DirectionsExample: React.FC = () => {
  const mapRef = useRef<GebetaMapRef>(null);
  const originMarkerRef = useRef<any>(null);
  const destMarkerRef = useRef<any>(null);
  const [originLat, setOriginLat] = useState("");
  const [originLon, setOriginLon] = useState("");
  const [destLat, setDestLat] = useState("");
  const [destLon, setDestLon] = useState("");
  const [summary, setSummary] = useState<any>(null);
  const [instructions, setInstructions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [clickMode, setClickMode] = useState<"origin" | "destination" | null>("origin");
  const clickModeRef = React.useRef(clickMode);
  React.useEffect(() => {
    clickModeRef.current = clickMode;
  }, [clickMode]);

  // Add a marker for origin or destination
  const showMarker = (lng: number, lat: number, type: "origin" | "destination") => {
    if (!mapRef.current) return;
    if (isNaN(lng) || isNaN(lat)) return;
    // Remove previous marker
    const ref = type === "origin" ? originMarkerRef : destMarkerRef;
    if (ref.current) {
      ref.current.marker.remove();
      ref.current = null;
    }
    // Add new marker
    const { marker } = mapRef.current.addImageMarker(
      [lng, lat],
      type === "origin" ? MARKER_ICON_ORIGIN : MARKER_ICON_DEST,
      [32, 32],
      undefined,
      1000
    );
    ref.current = { marker };
    marker.setLngLat([lng, lat]).addTo(mapRef.current.getMapInstance()!);
  };

  // Get directions and show route
  const handleGetDirections = async () => {
    setError(null);
    setSummary(null);
    setInstructions([]);
    mapRef.current?.clearRoute();
    try {
      const origin = { lat: Number(originLat), lng: Number(originLon) };
      const destination = { lat: Number(destLat), lng: Number(destLon) };
      if (isNaN(origin.lat) || isNaN(origin.lng) || isNaN(destination.lat) || isNaN(destination.lng)) {
        setError("Please provide valid coordinates for both origin and destination.");
        return;
      }
      const route = await mapRef.current?.getDirections(origin, destination);
      if (route) {
        mapRef.current?.displayRoute(route, { showMarkers: false, showInstructions: true });
        setSummary({ distance: route.distance, duration: route.duration });
        setInstructions(route.instructions || []);
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  // Handle map click: set origin or destination based on mode
  const handleMapClick = React.useCallback((lngLat: [number, number]) => {
    if (clickModeRef.current === "origin") {
      setOriginLat(lngLat[1].toString());
      setOriginLon(lngLat[0].toString());
      showMarker(lngLat[0], lngLat[1], "origin");
    } else if (clickModeRef.current === "destination") {
      setDestLat(lngLat[1].toString());
      setDestLon(lngLat[0].toString());
      showMarker(lngLat[0], lngLat[1], "destination");
    }
  }, []);

  // When fields change, update markers (just update state)
  const handleOriginLatChange = (lat: string) => setOriginLat(lat);
  const handleOriginLonChange = (lon: string) => setOriginLon(lon);
  const handleDestLatChange = (lat: string) => setDestLat(lat);
  const handleDestLonChange = (lon: string) => setDestLon(lon);

  // Update origin marker when originLat or originLon changes
  React.useEffect(() => {
    const coords = getLatLng({ lat: originLat, lon: originLon });
    if (coords) showMarker(coords[0], coords[1], "origin");
    // eslint-disable-next-line
  }, [originLat, originLon]);

  // Update destination marker when destLat or destLon changes
  React.useEffect(() => {
    const coords = getLatLng({ lat: destLat, lon: destLon });
    if (coords) showMarker(coords[0], coords[1], "destination");
    // eslint-disable-next-line
  }, [destLat, destLon]);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", background: "#f8fafc" }}>
      {/* Toolbar */}
      <div style={{
        position: "absolute", top: 30, left: 30, zIndex: 10, background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.10)", padding: 28, minWidth: 340, maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 18
      }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>Directions Example</h2>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 10, marginBottom: 10 }}>
          <button
            onClick={() => setClickMode("origin")}
            style={{
              background: clickMode === "origin" ? '#2563eb' : '#e5e7eb',
              color: clickMode === "origin" ? '#fff' : '#222',
              border: 'none',
              borderRadius: 6,
              padding: '8px 18px',
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: 15
            }}
          >
            Set Origin
          </button>
          <button
            onClick={() => setClickMode("destination")}
            style={{
              background: clickMode === "destination" ? '#2563eb' : '#e5e7eb',
              color: clickMode === "destination" ? '#fff' : '#222',
              border: 'none',
              borderRadius: 6,
              padding: '8px 18px',
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: 15
            }}
          >
            Set Destination
          </button>
          <span style={{ alignSelf: 'center', color: '#555', fontSize: 14, marginLeft: 8 }}>
            {clickMode === "origin" ? "Click map to set origin" : clickMode === "destination" ? "Click map to set destination" : ""}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input value={originLat} onChange={e => handleOriginLatChange(e.target.value)} placeholder="Origin Lat" style={{ width: 90, padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 15 }} />
            <input value={originLon} onChange={e => handleOriginLonChange(e.target.value)} placeholder="Origin Lon" style={{ width: 90, padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 15 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input value={destLat} onChange={e => handleDestLatChange(e.target.value)} placeholder="Dest Lat" style={{ width: 90, padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 15 }} />
            <input value={destLon} onChange={e => handleDestLonChange(e.target.value)} placeholder="Dest Lon" style={{ width: 90, padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 15 }} />
          </div>
          <button onClick={handleGetDirections} style={{ marginTop: 8, padding: '8px 18px', borderRadius: 6, fontWeight: 500, fontSize: 15, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer' }}>Get Directions</button>
        </div>
        <div style={{ fontSize: 13, color: '#555', marginTop: 10, lineHeight: 1.6 }}>
          <b>Tips:</b><br />
          • Click the map to set origin and destination<br />
          • Edit fields to update markers<br />
          • Only valid coordinates will show markers<br />
        </div>
        {error && <div style={{ color: '#b91c1c', fontWeight: 500 }}>{error}</div>}
        {summary && (
          <div style={{ marginTop: 10, fontSize: 15 }}>
            <b>Distance:</b> {summary.distance} <br />
            <b>Duration:</b> {summary.duration}
          </div>
        )}
        {instructions.length > 0 && (
          <div style={{ marginTop: 10, maxHeight: 120, overflowY: 'auto' }}>
            <b>Instructions:</b>
            <ol style={{ paddingLeft: 18 }}>
              {instructions.map((step, i) => (
                <li key={i} style={{ marginBottom: 4, fontSize: 14 }}>{step.path || step.instruction || JSON.stringify(step)}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
      {/* Map */}
      <div style={{ width: "100%", height: "100%" }}>
        <GebetaMap
          ref={mapRef}
          apiKey={import.meta.env.VITE_GEBETA_MAPS_API_KEY}
          center={[38.7685, 9.0161]}
          zoom={14}
          onMapClick={handleMapClick}
        />
      </div>
    </div>
  );
};

export default DirectionsExample; 