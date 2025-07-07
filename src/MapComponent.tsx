
import { useEffect, useRef, useState } from 'react';
import { GebetaMaps } from './lib/GebetaMaps'; // Adjust the import path as needed
import * as React from 'react';


interface MapDisplayProps {
    apiKey: string;
    initialState: {
        lng: number;
        lat: number;
        zoom: number;
    };
}

const MapDisplay: React.FC<MapDisplayProps> = ({ apiKey, initialState }) => {

    const mapContainer = useRef<HTMLDivElement>(null);

    const gebetaMapsInstance = useRef<GebetaMaps | null>(null);

    useEffect(() => {
        if (!mapContainer.current) return;
        if (gebetaMapsInstance.current) return;

        gebetaMapsInstance.current = new GebetaMaps({ apiKey });

        const map = gebetaMapsInstance.current.init({
            container: mapContainer.current,
            center: [initialState.lng, initialState.lat],
            zoom: initialState.zoom,
        });

        gebetaMapsInstance.current.addNavigationControls();

        map.on('click', (e) => {
            const imageUrl = 'https://cdn-icons-png.flaticon.com/512/484/484167.png'; // Custom icon
            gebetaMapsInstance.current?.addImageMarker(
                [e.lngLat.lng, e.lngLat.lat],
                imageUrl,
                [40, 40] // optional size
            );
        });



        return () => {
            map.remove(); // ensures event listeners are cleaned up
            gebetaMapsInstance.current = null;
        };
    }, [apiKey, initialState]);



    return (
        <div
            ref={mapContainer}
            style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
            }}
        />
    );
};

export default MapDisplay;
