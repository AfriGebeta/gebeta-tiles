import React, { useRef } from "react";
import GebetaMap, { GebetaMapRef } from "src/lib/GebetaMap";

const MinimalMapExample: React.FC = () => {
  const mapRef = useRef<GebetaMapRef>(null);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <GebetaMap
        ref={mapRef}
        apiKey={import.meta.env.VITE_GEBETA_MAPS_API_KEY}
        center={[38.7685, 9.0161]}
        zoom={15}
        onMapClick={() => console.log("map clicked")}
      />
    </div>
  );
};

export default MinimalMapExample; 