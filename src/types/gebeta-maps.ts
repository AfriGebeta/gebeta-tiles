// src/types/gebeta-maps.ts

import { GeolocateControlOptions } from 'maplibre-gl';
import { Map as Map_2 } from 'maplibre-gl';
import { MapOptions } from 'maplibre-gl';
import { MarkerOptions } from 'maplibre-gl';
import { NavigationControlOptions } from 'maplibre-gl';
import * as GebetaMapsGl from 'maplibre-gl';
import { PopupOptions } from 'maplibre-gl';

declare type MapMethods = {
    [key: string]: any;
};

declare interface GebetaMapsProps {
    apiKey: string;
    mode?: 'standard' | 'light' | 'dark' | 'satellite' | 'custom';
    threedTileset?: string;
    accessToken?: string;
}

export declare class GebetaMaps {
    private gebetaMaps;
    private apiKey;
    private accessToken;
    mode: string;
    private threedTileset;
    constructor({ apiKey, accessToken, mode, threedTileset }: GebetaMapsProps);
    private addGebetaLogo;
    private addAttribution;
    private fetchStaticMap;
    private add3dLayer;
    init(options?: MapOptions): Map_2 & MapMethods;
    addNavigationControls(options?: NavigationControlOptions): GebetaMapsGl.NavigationControl;
    addGeolocateControls(options: GeolocateControlOptions): GebetaMapsGl.GeolocateControl;
    getMercatorCoordinate(): typeof GebetaMapsGl.MercatorCoordinate;
    addMarker(options?: MarkerOptions): GebetaMapsGl.Marker;
    addPopup(options?: PopupOptions): GebetaMapsGl.Popup;
    getStaticMap(url: string, elementID: string): void;
}

// Export the Gebeta tiles URL as a constant
export const GEBETA_TILES_URL = 'https://tiles.gebeta.app';