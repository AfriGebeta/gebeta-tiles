import React, { useRef, useState } from "react";
import GebetaMap from "src/lib/GebetaMap";
import type { GebetaMapRef } from "src/lib/GebetaMap";

const MARKER_ICON = "https://cdn-icons-png.flaticon.com/512/484/484167.png";

const inputStyle: React.CSSProperties = {
  marginLeft: 8,
  padding: '8px 12px',
  borderRadius: 6,
  border: '1px solid #d1d5db',
  fontSize: 15,
  background: '#f9fafb',
  outline: 'none',
  minWidth: 0,
};
const buttonStyle: React.CSSProperties = {
  marginLeft: 8,
  padding: '8px 18px',
  borderRadius: 6,
  border: 'none',
  background: '#2563eb',
  color: '#fff',
  fontWeight: 500,
  fontSize: 15,
  cursor: 'pointer',
  transition: 'background 0.2s',
};
const buttonSecondary: React.CSSProperties = {
  ...buttonStyle,
  background: '#e5e7eb',
  color: '#222',
};

// Helper to extract [lng, lat] from a geocoding result
function getLatLng(item: any): [number, number] | null {
  const lat = Number(item.lat ?? item.latitude);
  const lng = Number(item.lon ?? item.lng ?? item.longitude);
  if (isNaN(lat) || isNaN(lng)) return null;
  return [lng, lat];
}

const GeocodingExample: React.FC = () => {
  const mapRef = useRef<GebetaMapRef>(null);
  const markerRef = useRef<any>(null);
  const [query, setQuery] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Add a marker with popup and fly to location
  const showMarker = (lng: number, lat: number, popupHtml?: string) => {
    if (!mapRef.current) return;
    if (isNaN(lng) || isNaN(lat)) return;
    // Remove previous marker
    if (markerRef.current) {
      markerRef.current.marker.remove();
      markerRef.current = null;
    }
    // Add new marker
    const { marker, popup } = mapRef.current.addImageMarker(
      [lng, lat],
      MARKER_ICON,
      [32, 32],
      undefined,
      900,
      popupHtml
    );
    markerRef.current = { marker, popup };
    marker.setLngLat([lng, lat]).addTo(mapRef.current.getMapInstance()!);
    if (popup) popup.addTo(mapRef.current.getMapInstance()!);
    // Fly to
    mapRef.current.getMapInstance()?.flyTo({ center: [lng, lat], zoom: 15 });
  };

  // Format popup HTML for a place result
  const formatPopup = (item: any) => {
    return `<div style='font-size:14px; color:#333; min-width:180px;'>
      <strong>${item.name || item.Name || 'Unknown'}</strong><br/>
      <span style='color:#666;'>${item.city || item.City || ''}, ${item.country || item.Country || ''}</span><br/>
      <span style='color:#888;'>Lat: ${item.lat || item.latitude}, Lng: ${item.lng || item.longitude}</span><br/>
      <span style='color:#888;'>Type: ${item.type || ''}</span>
    </div>`;
  };

  // Forward geocode
  const handleGeocode = async () => {
    setError(null);
    setResults([]);
    try {
      const res = await mapRef.current?.geocode(query);
      setResults(res || []);
      if (res && res.length > 0) {
        const coords = getLatLng(res[0]);
        if (coords) showMarker(coords[0], coords[1], formatPopup(res[0]));
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  // Reverse geocode from fields
  const handleReverseGeocode = async () => {
    setError(null);
    setResults([]);
    try {
      const res = await mapRef.current?.reverseGeocode(Number(lat), Number(lon));
      setResults(res || []);
      if (res && res.length > 0) {
        const coords = getLatLng(res[0]);
        if (coords) showMarker(coords[0], coords[1], formatPopup(res[0]));
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  // Reverse geocode on map click
  const handleMapClick = async (lngLat: [number, number]) => {
    setError(null);
    setResults([]);
    setLat(lngLat[1].toString());
    setLon(lngLat[0].toString());
    try {
      const res = await mapRef.current?.reverseGeocode(lngLat[1], lngLat[0]);
      setResults(res || []);
      if (res && res.length > 0) {
        const coords = getLatLng(res[0]);
        if (coords) showMarker(coords[0], coords[1], formatPopup(res[0]));
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  // Click on result: add marker, fly to, open popup
  const handleResultClick = (item: any) => {
    const coords = getLatLng(item);
    if (!coords) return;
    showMarker(coords[0], coords[1], formatPopup(item));
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", background: "#f8fafc" }}>
      {/* Toolbar */}
      <div style={{
        position: "absolute", top: 30, left: 30, zIndex: 10, background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.10)", padding: 28, minWidth: 340, maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 18
      }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>Geocoding Example</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Enter place name..." style={{ ...inputStyle, flex: 1 }} />
            <button onClick={handleGeocode} style={buttonStyle}>Search</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input value={lat} onChange={e => setLat(e.target.value)} placeholder="Lat" style={{ ...inputStyle, width: 90 }} />
            <input value={lon} onChange={e => setLon(e.target.value)} placeholder="Lon" style={{ ...inputStyle, width: 90 }} />
            <button onClick={handleReverseGeocode} style={buttonSecondary}>Reverse</button>
          </div>
        </div>
        {error && <div style={{ color: '#b91c1c', fontWeight: 500, marginTop: 4 }}>{error}</div>}
        <div style={{ maxHeight: 200, overflowY: 'auto', marginTop: 8 }}>
          {results.length > 0 && (
            <ul style={{ paddingLeft: 0, margin: 0, listStyle: 'none' }}>
              {results.map((r, i) => {
                const lng = r.lon || r.lng;
                const latNum = r.lat;
                return (
                  <li
                    key={i}
                    style={{ marginBottom: 8, fontSize: 15, borderBottom: '1px solid #eee', padding: '8px 0', cursor: 'pointer', borderRadius: 6, transition: 'background 0.2s' }}
                    onClick={() => handleResultClick(r)}
                    onMouseOver={e => (e.currentTarget.style.background = '#f1f5f9')}
                    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <strong>{r.name || r.Name || 'Unknown'}</strong><br />
                    <span style={{ color: '#666' }}>{r.city || r.City || ''}{r.city || r.City ? ', ' : ''}{r.country || r.Country || ''}</span><br />
                    <span style={{ color: '#888' }}>Lat: {latNum}, Lng: {lng}</span><br />
                    <span style={{ color: '#888' }}>Type: {r.type || ''}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div style={{ fontSize: 13, color: '#555', marginTop: 10, lineHeight: 1.6 }}>
          <b>Tips:</b><br />
          • Click a result to fly to it and see details<br />
          • Click anywhere on the map to reverse geocode<br />
          • Only one marker is shown at a time
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
        />
      </div>
    </div>
  );
};

export default GeocodingExample; 