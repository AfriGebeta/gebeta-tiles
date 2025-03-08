import { createContext, useContext } from 'react';
import type { Map } from 'maplibre-gl';

export const MapContext = createContext<Map | null>(null);

export const useMap = () => {
  const map = useContext(MapContext);
  if (!map) {
    throw new Error('useMap must be used within a MapContext.Provider');
  }
  return map;
}; 