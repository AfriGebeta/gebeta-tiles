// Jest test file for advanced marker management in GebetaMaps
import React, { useRef, useEffect } from "react";
import { render, screen } from "@testing-library/react";
import { GebetaMaps } from "src/lib/GebetaMaps";
import { DATA_TEST_ID } from "src/lib/DATA_TEST_ID";
import userEvent from "@testing-library/user-event";

jest.mock('maplibre-gl', () => {
  return {
    Map: jest.fn().mockImplementation(() => ({
      addControl: jest.fn(),
      getContainer: jest.fn(),
      remove: jest.fn(),
    })),
    Marker: jest.fn().mockImplementation(() => ({
      setLngLat: jest.fn().mockReturnThis(),
      addTo: jest.fn().mockReturnThis(),
      setPopup: jest.fn().mockReturnThis(),
      remove: jest.fn(),
      _element: document.createElement('div'),
    })),
    Popup: jest.fn().mockImplementation(() => ({
      setHTML: jest.fn().mockReturnThis(),
      addTo: jest.fn().mockReturnThis(),
      remove: jest.fn(),
    })),
    NavigationControl: jest.fn(),
    AttributionControl: jest.fn(),
    GeolocateControl: jest.fn(),
    MercatorCoordinate: {},
  };
});

describe("GebetaMaps advanced marker management", () => {
  let gebetaMaps: GebetaMaps;
  let mapContainer: HTMLDivElement | null = null;

  // Minimal React wrapper to provide a DOM container
  const MapWrapper = () => {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
      mapContainer = ref.current;
    }, []);
    return (
      <div data-testid={DATA_TEST_ID.mapContainer} ref={ref} />
    );
  };

  beforeEach(() => {
    render(<MapWrapper />);
    gebetaMaps = new GebetaMaps({ apiKey: "test" }) as any;
    // Simulate maplibregl.Map instance with required methods
    (gebetaMaps as any).gebetaMaps = {
      addControl: jest.fn(),
      getContainer: () => mapContainer,
      remove: jest.fn(),
    };
  });

  test("should add a marker with custom icon, size, and popup", () => {
    // WHEN addImageMarker is called
    const result = gebetaMaps.addImageMarker(
      [38.7685, 9.0161],
      "icon.png",
      [40, 40],
      undefined,
      10,
      "<b>Popup</b>"
    );
    // THEN a marker and popup are returned
    expect(result.marker).toBeDefined();
    expect(result.popup).toBeDefined();
  });


  test("should add multiple markers and clear them all", () => {
    // WHEN multiple markers are added
    gebetaMaps.addImageMarker([1, 2], "a.png");
    gebetaMaps.addImageMarker([3, 4], "b.png");
    // THEN getMarkers returns both
    expect(gebetaMaps.getMarkers().length).toBe(2);
    // WHEN clearAllMarkers is called
    gebetaMaps.clearAllMarkers();
    // THEN getMarkers returns empty
    expect(gebetaMaps.getMarkers().length).toBe(0);
  });

  test("should remove a single marker", () => {
    // WHEN a marker is added
    const { marker } = gebetaMaps.addImageMarker([1, 2], "a.png");
    // AND removeMarker is called
    gebetaMaps.removeMarker(marker);
    // THEN getMarkers returns empty
    expect(gebetaMaps.getMarkers().length).toBe(0);
  });
}); 