import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import MapPolygon from '../components/MapPolygon';
import { Map } from 'maplibre-gl';

// TODO: fix tests
xdescribe('MapPolygon', () => {
  // GIVEN mock setup
  const mockSource = {
    setData: jest.fn(),
  };

  const mockMap = {
    addSource: jest.fn(),
    addLayer: jest.fn(),
    removeLayer: jest.fn(),
    removeSource: jest.fn(),
    getSource: jest.fn(() => null),
    getLayer: jest.fn(() => null),
  } as unknown as Map;

  const defaultProps = {
    coordinates: [
      [38.7578, 8.9806],
      [38.7600, 8.9850],
      [38.7650, 8.9830],
      [38.7578, 8.9806],
    ] as [number, number][],
    color: '#FF0000',
    id: 'test-polygon',
    map: mockMap,
  };

  beforeEach(() => {
    // GIVEN mocks are reset
    jest.clearAllMocks();
    // AND source doesn't exist initially
    (mockMap.getSource as jest.Mock).mockReturnValue(null);
    // AND layers don't exist initially
    (mockMap.getLayer as jest.Mock).mockReturnValue(null);
  });

  it('should add source and layers on mount', () => {
    // WHEN rendering the polygon
    render(<MapPolygon {...defaultProps} />);

    // THEN source should be added
    expect(mockMap.addSource).toHaveBeenCalledWith(
      'test-polygon-source',
      expect.objectContaining({
        type: 'geojson',
        data: expect.objectContaining({
          type: 'Feature',
          geometry: expect.objectContaining({
            type: 'Polygon',
            coordinates: defaultProps.coordinates,
          }),
        }),
      }),
    );

    // AND fill layer should be added
    expect(mockMap.addLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'test-polygon-layer',
        type: 'fill',
        source: 'test-polygon-source',
        paint: expect.objectContaining({
          'fill-color': defaultProps.color,
          'fill-opacity': 0.5,
        }),
      }),
    );

    // AND outline layer should be added
    expect(mockMap.addLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'test-polygon-outline',
        type: 'line',
        source: 'test-polygon-source',
        paint: expect.objectContaining({
          'line-color': '#000000',
          'line-width': 1,
        }),
      }),
    );
  });

  it('should update existing source and layers', () => {
    // GIVEN polygon is rendered and source exists
    (mockMap.getSource as jest.Mock).mockReturnValue(mockSource);
    const { rerender } = render(<MapPolygon {...defaultProps} />);

    // WHEN coordinates are updated
    const newCoordinates = [
      [38.7578, 8.9806],
      [38.7600, 8.9850],
      [38.7650, 8.9830],
      [38.7578, 8.9806],
    ] as [number, number][];
    rerender(<MapPolygon {...defaultProps} coordinates={newCoordinates} />);

    // THEN source data should be updated
    expect(mockSource.setData).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'Feature',
        geometry: expect.objectContaining({
          type: 'Polygon',
          coordinates: newCoordinates,
        }),
      }),
    );
  });

  it('should cleanup on unmount', () => {
    // GIVEN polygon is rendered
    const { unmount } = render(<MapPolygon {...defaultProps} />);
    // AND layers exist
    (mockMap.getLayer as jest.Mock)
      .mockReturnValueOnce({}) // For test-polygon-layer
      .mockReturnValueOnce({}); // For test-polygon-outline
    // AND source exists
    (mockMap.getSource as jest.Mock).mockReturnValue({});

    // WHEN component is unmounted
    unmount();

    // THEN layers and source should be removed
    expect(mockMap.removeLayer).toHaveBeenCalledWith('test-polygon-layer');
    expect(mockMap.removeLayer).toHaveBeenCalledWith('test-polygon-outline');
    expect(mockMap.removeSource).toHaveBeenCalledWith('test-polygon-source');
  });
}); 