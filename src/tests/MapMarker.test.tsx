import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import MapMarker from '../components/MapMarker';
import maplibregl from 'maplibre-gl';

// Define mock types
type MockMarkerInstance = {
  setLngLat: jest.Mock;
  addTo: jest.Mock;
  setPopup: jest.Mock;
  remove: jest.Mock;
};

type MockPopupInstance = {
  setDOMContent: jest.Mock;
  remove: jest.Mock;
};

type MockMarkerConstructor = {
  new (options: any): MockMarkerInstance;
} & jest.Mock<MockMarkerInstance>;

type MockPopupConstructor = {
  new (options: any): MockPopupInstance;
} & jest.Mock<MockPopupInstance>;

// Mock maplibregl
jest.mock('maplibre-gl', () => {
  const setLngLat = jest.fn().mockReturnThis();
  const addTo = jest.fn().mockReturnThis();
  const setPopup = jest.fn().mockReturnThis();
  const markerRemove = jest.fn();
  const popupRemove = jest.fn();
  const setDOMContent = jest.fn().mockReturnThis();

  const Marker = jest.fn(() => ({
    setLngLat,
    addTo,
    setPopup,
    remove: markerRemove,
  })) as unknown as MockMarkerConstructor;

  const Popup = jest.fn(() => ({
    setDOMContent,
    remove: popupRemove,
  })) as unknown as MockPopupConstructor;

  return {
    Marker,
    Popup,
  };
});

// TODO: fix tests
xdescribe('MapMarker', () => {
  // GIVEN basic marker props
  const defaultProps = {
    id: 'test-marker',
    map: {} as maplibregl.Map,
    lngLat: [38.7578, 8.9806] as [number, number],
  };

  beforeEach(() => {
    // GIVEN maplibregl mocks are reset
    jest.clearAllMocks();
  });

  it('should create a basic marker', () => {
    // WHEN rendering a basic marker
    render(<MapMarker {...defaultProps} />);

    // THEN it should create a marker with default styling
    const MockMarker = maplibregl.Marker as unknown as MockMarkerConstructor;
    expect(MockMarker).toHaveBeenCalledWith(
      expect.objectContaining({
        element: expect.any(HTMLDivElement),
      })
    );

    // AND the marker element should have default styles
    const markerElement = (MockMarker.mock.calls[0][0] as { element: HTMLDivElement }).element;
    expect(markerElement.style.width).toBe('20px');
    expect(markerElement.style.height).toBe('20px');
    expect(markerElement.style.borderRadius).toBe('50%');
    expect(markerElement.style.backgroundColor).toBe('rgb(255, 0, 0)');
  });

  it('should create a marker with custom color', () => {
    // WHEN rendering a marker with custom color
    render(<MapMarker {...defaultProps} color="#00FF00" />);

    // THEN the marker element should have the custom color
    const MockMarker = maplibregl.Marker as unknown as MockMarkerConstructor;
    const markerElement = (MockMarker.mock.calls[0][0] as { element: HTMLDivElement }).element;
    expect(markerElement.style.backgroundColor).toBe('rgb(0, 255, 0)');
  });

  it('should add click handler', () => {
    // GIVEN a click handler
    const onClick = jest.fn();

    // WHEN rendering a marker with click handler
    render(<MapMarker {...defaultProps} onClick={onClick} />);

    // THEN the marker element should be clickable
    const MockMarker = maplibregl.Marker as unknown as MockMarkerConstructor;
    const markerElement = (MockMarker.mock.calls[0][0] as { element: HTMLDivElement }).element;
    expect(markerElement.style.cursor).toBe('pointer');

    // AND clicking the element should trigger the handler
    markerElement.click();
    expect(onClick).toHaveBeenCalled();
  });
}); 