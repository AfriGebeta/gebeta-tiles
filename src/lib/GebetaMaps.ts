import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Map as MapLibreMap } from "maplibre-gl";
import FenceManager, { Fence, FencePoint } from "src/lib/FenceManager";

declare type MapMethods = {
    [key: string]: any;
};

export declare interface GebetaMapsProps {
    apiKey: string;

    
}

export class GebetaMaps {
    private gebetaMaps: (maplibregl.Map & MapMethods) | null = null;
    private apiKey: string;
    private markerList: maplibregl.Marker[] = [];
    private fenceManager: FenceManager | null = null;



    constructor({ apiKey, }: GebetaMapsProps) {
        this.apiKey = apiKey;


        if (!this.apiKey) {
            console.error("An API key or an access token is required.");
        }
    }


    private addGebetaLogo() {
        if (!this.gebetaMaps) return;
        const logoContainer = document.createElement('div');
        logoContainer.className = 'maplibregl-ctrl-bottom-left';
        this.gebetaMaps.getContainer().appendChild(logoContainer);
    }


    private addAttribution() {
        if (!this.gebetaMaps) return;
        this.gebetaMaps.addControl(new maplibregl.AttributionControl({
            customAttribution: '<a style="margin-bottom:5px;" href="https://www.gebeta.app" target="_blank">© Gebeta Maps</a>'
        }));
    }



    private async fetchStaticMap(url: string, elementID: string) {
        try {
            const response = await fetch(url);
            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const imageBlob = await response.blob();
            const imageUrl = URL.createObjectURL(imageBlob);
            const imgElement = document.getElementById(elementID) as HTMLImageElement;
            if(imgElement) {
                imgElement.src = imageUrl;
            } else {
                console.error(`Element with ID '${elementID}' not found.`);
            }
        } catch (error) {
            console.error("Error fetching static map:", error);
        }
    }


    private add3dLayer() {
        if (!this.gebetaMaps ) return;
        this.gebetaMaps.on('load', () => {
            if (!this.gebetaMaps) return;
            this.gebetaMaps.addSource('3d-tiles', {
                type: 'vector',

            });
            this.gebetaMaps.addLayer({
                'id': '3d-buildings',
                'source': '3d-tiles',
                'source-layer': 'buildings',
                'type': 'fill-extrusion',
                'minzoom': 15,
                'paint': {
                    'fill-extrusion-color': '#aaa',
                    'fill-extrusion-height': [
                        "interpolate", ["linear"], ["zoom"],
                        15, 0,
                        15.05, ["get", "height"]
                    ],
                    'fill-extrusion-base': ["get", "min_height"],
                    'fill-extrusion-opacity': .6
                }
            });
        });
    }


    public init(options: maplibregl.MapOptions): maplibregl.Map & MapMethods {

        const styleUrl = `https://tiles.gebeta.app/styles/standard/style.json`;

        this.gebetaMaps = new maplibregl.Map({
            ...options,
            style: styleUrl,
            attributionControl: false
        }) as maplibregl.Map & MapMethods;

        this.addGebetaLogo();
        this.addAttribution();
        // Initialize FenceManager
        this.fenceManager = new FenceManager(this.gebetaMaps);
        return this.gebetaMaps;
    }


    public addNavigationControls(options?: maplibregl.NavigationControlOptions): maplibregl.NavigationControl {
        if (!this.gebetaMaps) throw new Error("Map not initialized");
        const navControl = new maplibregl.NavigationControl(options);
        this.gebetaMaps.addControl(navControl);
        return navControl;
    }


    public addGeolocateControls(options: maplibregl.GeolocateControlOptions): maplibregl.GeolocateControl {
        if (!this.gebetaMaps) throw new Error("Map not initialized");
        const geoControl = new maplibregl.GeolocateControl(options);
        this.gebetaMaps.addControl(geoControl);
        return geoControl;
    }


    public getMercatorCoordinate(): typeof maplibregl.MercatorCoordinate {
        return maplibregl.MercatorCoordinate;
    }


    public addMarker(options?: maplibregl.MarkerOptions): maplibregl.Marker {
        if (!this.gebetaMaps) throw new Error("Map not initialized");
        const marker = new maplibregl.Marker(options);
        this.markerList.push(marker);
        return marker;
    }


    public addPopup(options?: maplibregl.PopupOptions): maplibregl.Popup {
        if (!this.gebetaMaps) throw new Error("Map not initialized");
        const popup = new maplibregl.Popup(options);

        return popup;
    }


    public getStaticMap(url: string, elementID: string): void {
        const fullUrl = `${url}?api_key=${this.apiKey}`;
        this.fetchStaticMap(fullUrl, elementID);
    }

    /**
     * Add a marker with custom icon, size, popup, z-index, and click handler.
     * @param lngLat - [longitude, latitude] of the marker
     * @param imageUrl - URL of the marker icon
     * @param size - [width, height] in pixels
     * @param onClick - Optional click handler for the marker
     * @param zIndex - Optional z-index for stacking order
     * @param popupHtml - Optional HTML for marker popup
     * @returns An object containing the marker and optional popup
     */
    public addImageMarker(
        lngLat: [number, number],
        imageUrl: string,
        size: [number, number] = [32, 32],
        onClick?: (lngLat: [number, number], marker: maplibregl.Marker, event: MouseEvent) => void,
        zIndex: number = 10,
        popupHtml?: string
    ): { marker: maplibregl.Marker, popup?: maplibregl.Popup } {
        if (!this.gebetaMaps) throw new Error("Map not initialized");
        const el = document.createElement('div');
        el.style.backgroundImage = `url('${imageUrl}')`;
        el.style.backgroundSize = 'contain';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.width = `${size[0]}px`;
        el.style.height = `${size[1]}px`;
        el.style.cursor = 'pointer';
        el.style.zIndex = zIndex.toString();
        const marker = new maplibregl.Marker({ element: el })
            .setLngLat(lngLat)
            .addTo(this.gebetaMaps);
        let popup: maplibregl.Popup | undefined = undefined;
        if (popupHtml) {
            popup = new maplibregl.Popup({ offset: 18 }).setHTML(popupHtml);
            marker.setPopup(popup);
        }
        if (onClick) {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                onClick(lngLat, marker, e as MouseEvent);
            });
        }
        this.markerList.push(marker);
        return { marker, popup };
    }

    /**
     * Remove a marker from the map.
     * @param marker - The marker instance to remove
     */
    public removeMarker(marker: maplibregl.Marker): void {
        marker.remove();
        this.markerList = this.markerList.filter(m => m !== marker);
    }

    /**
     * Remove all markers from the map.
     */
    public clearAllMarkers(): void {
        this.markerList.forEach(marker => marker.remove());
        this.markerList = [];
    }

    /**
     * Get all markers currently on the map.
     * @returns An array of all marker instances
     */
    public getMarkers(): maplibregl.Marker[] {
        return [...this.markerList];
    }

    /** Start drawing mode for a new fence. */
    public startFence() {
        if (!this.fenceManager) throw new Error("FenceManager not initialized");
        this.fenceManager.startFenceDrawing();
    }

    /** Add a point to the current fence. */
    public addFencePoint(
        lngLat: FencePoint,
        customImage: string | null = null,
        onClick: ((lngLat: FencePoint, marker: maplibregl.Marker, event: MouseEvent) => void) | null = null
    ) {
        if (!this.fenceManager) throw new Error("FenceManager not initialized");
        this.fenceManager.addFencePoint(
            lngLat,
            customImage,
            onClick,
            (lngLat, imageUrl, size, onClickCb) => this.addImageMarker(lngLat, imageUrl, size, onClickCb)
        );
    }

    /** Close the current fence. */
    public closeFence() {
        if (!this.fenceManager) throw new Error("FenceManager not initialized");
        this.fenceManager.closeFence();
    }

    /** Clear the current fence. */
    public clearFence() {
        if (!this.fenceManager) throw new Error("FenceManager not initialized");
        this.fenceManager.clearFence();
    }

    /** Clear all fences. */
    public clearAllFences() {
        if (!this.fenceManager) throw new Error("FenceManager not initialized");
        this.fenceManager.clearAllFences();
    }

    /** Get all stored fences. */
    public getFences(): Fence[] {
        if (!this.fenceManager) throw new Error("FenceManager not initialized");
        return this.fenceManager.getFences();
    }

    /** Get the current fence points. */
    public getFencePoints(): FencePoint[] {
        if (!this.fenceManager) throw new Error("FenceManager not initialized");
        return this.fenceManager.getFencePoints();
    }

    /** Returns true if currently in drawing mode. */
    public isDrawingFence(): boolean {
        if (!this.fenceManager) throw new Error("FenceManager not initialized");
        return this.fenceManager.isDrawingFence();
    }

    public remove(): void {
        if (this.gebetaMaps) {
            this.gebetaMaps.remove();
            this.gebetaMaps = null;
        }
    }
}

export type { MapLibreMap as Map };
