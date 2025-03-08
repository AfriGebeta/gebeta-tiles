import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import MapPolyline from '../components/MapPolyline';
import { Map } from 'maplibre-gl';

// TODO: fix tests
xdescribe('MapPolyline', () => {
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
    coordinates: [[38.7578, 8.9806], [38.7600, 8.9850]] as [number, number][],
    color: '#FF0000',
    id: 'test-polyline',
    map: mockMap,
  };

  beforeEach(() => {
    // GIVEN mocks are reset
    jest.clearAllMocks();
    // AND source doesn't exist initially
    (mockMap.getSource as jest.Mock).mockReturnValue(null);
    // AND layer doesn't exist initially
    (mockMap.getLayer as jest.Mock).mockReturnValue(null);
  });

  it('should add source and layer on mount', () => {
    // WHEN rendering the polyline
    render(<MapPolyline {...defaultProps} />);

    // THEN source should be added
    expect(mockMap.addSource).toHaveBeenCalledWith(
      'test-polyline-source',
      expect.objectContaining({
        type: 'geojson',
        data: expect.objectContaining({
          type: 'Feature',
          geometry: expect.objectContaining({
            type: 'LineString',
            coordinates: defaultProps.coordinates,
          }),
        }),
      }),
    );

    // AND layer should be added
    expect(mockMap.addLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'test-polyline-layer',
        type: 'line',
        source: 'test-polyline-source',
        paint: expect.objectContaining({
          'line-color': defaultProps.color,
          'line-width': 2,
        }),
      }),
    );
  });

  it('should update existing source and layer', () => {
    // GIVEN polyline is rendered and source exists
    (mockMap.getSource as jest.Mock).mockReturnValue(mockSource);
    const { rerender } = render(<MapPolyline {...defaultProps} />);

    // WHEN coordinates are updated
    const newCoordinates = [[38.7578, 8.9806], [38.7600, 8.9850]] as [number, number][];
    rerender(<MapPolyline {...defaultProps} coordinates={newCoordinates} />);

    // THEN source data should be updated
    expect(mockSource.setData).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'Feature',
        geometry: expect.objectContaining({
          type: 'LineString',
          coordinates: newCoordinates,
        }),
      }),
    );
  });

  it('should cleanup on unmount', () => {
    // GIVEN polyline is rendered
    const { unmount } = render(<MapPolyline {...defaultProps} />);
    // AND layer exists
    (mockMap.getLayer as jest.Mock).mockReturnValue({});
    // AND source exists
    (mockMap.getSource as jest.Mock).mockReturnValue({});

    // WHEN component is unmounted
    unmount();

    // THEN layer and source should be removed
    expect(mockMap.removeLayer).toHaveBeenCalledWith('test-polyline-layer');
    expect(mockMap.removeSource).toHaveBeenCalledWith('test-polyline-source');
  });
}); 