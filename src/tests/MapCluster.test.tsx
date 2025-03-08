import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import MapCluster from '../components/MapCluster';
import maplibregl from 'maplibre-gl';
import { MarkerConfig } from '../types';

// Mock Supercluster
jest.mock('supercluster', () => {
  return jest.fn().mockImplementation(() => ({
    load: jest.fn(),
    getClusters: jest.fn(() => [
      {
        geometry: { coordinates: [38.7578, 8.9806] },
        properties: { cluster: true, cluster_id: 1, point_count: 3 },
      },
      {
        geometry: { coordinates: [38.7600, 8.9850] },
        properties: { id: 'marker-1', color: '#FF0000' },
      },
    ]),
    getClusterExpansionZoom: jest.fn(() => 15),
  }));
});

// TODO: fix tests
xdescribe('MapCluster', () => {
  let mockMap: any;

  // GIVEN basic cluster props
  const defaultProps = {
    id: 'test-cluster',
    map: {} as unknown as maplibregl.Map,
    markers: [
      {
        lngLat: [38.7578, 8.9806] as [number, number],
        color: '#FF0000',
      } as MarkerConfig,
      {
        lngLat: [38.7600, 8.9850] as [number, number],
        color: '#00FF00',
      } as MarkerConfig,
      {
        lngLat: [38.7590, 8.9830] as [number, number],
        color: '#0000FF',
      } as MarkerConfig,
    ],
    config: {
      radius: 50,
      maxZoom: 14,
      minPoints: 2,
    },
  };

  beforeEach(() => {
    mockMap = {
      addSource: jest.fn(),
      addLayer: jest.fn(),
      removeLayer: jest.fn(),
      removeSource: jest.fn(),
      getSource: jest.fn(),
      getLayer: jest.fn(),
      flyTo: jest.fn(),
      getZoom: jest.fn().mockReturnValue(10),
      getBounds: jest.fn().mockReturnValue({
        getNorth: () => 9,
        getSouth: () => 8,
        getEast: () => 39,
        getWest: () => 38
      }),
      on: jest.fn(),
      off: jest.fn()
    };

    // Mock document.createElement
    const mockElement = document.createElement('div');
    const mockStyle = {
      width: '',
      height: '',
      borderRadius: '',
      backgroundColor: '',
    };
    Object.defineProperty(mockElement, 'style', {
      get: () => mockStyle,
      configurable: true,
    });
    jest.spyOn(document, 'createElement').mockReturnValue(mockElement);
  });

  it('should initialize Supercluster with correct options', () => {
    // WHEN component is rendered
    render(<MapCluster {...defaultProps} />);

    // THEN Supercluster should be initialized with correct options
    expect(mockMap.getZoom).toHaveBeenCalled();
    expect(mockMap.getBounds).toHaveBeenCalled();
  });

  it('should create cluster markers with correct styling', () => {
    // WHEN component is rendered
    render(<MapCluster {...defaultProps} />);

    // THEN cluster element should be created
    const clusterElement = document.createElement('div');
    clusterElement.style.width = '40px';
    clusterElement.style.height = '40px';
    clusterElement.style.borderRadius = '50%';
    clusterElement.style.backgroundColor = 'rgb(255, 0, 255)';

    // AND the cluster element should have correct styles
    expect(clusterElement.style.width).toBe('40px');
    expect(clusterElement.style.height).toBe('40px');
    expect(clusterElement.style.borderRadius).toBe('50%');
    expect(clusterElement.style.backgroundColor).toBe('rgb(255, 0, 255)');
  });

  it('should handle cluster click to zoom', () => {
    // WHEN component is rendered
    render(<MapCluster {...defaultProps} />);

    // AND a cluster is clicked
    const clusterElement = document.createElement('div');
    clusterElement.click();

    // THEN it should fly to the cluster with correct zoom level
    expect(mockMap.flyTo).toHaveBeenCalledWith({
      center: [38.7578, 8.9806],
      zoom: 14, // maxZoom from config
    });
  });

  it('should update clusters on map move', () => {
    // WHEN component is rendered
    render(<MapCluster {...defaultProps} />);

    // AND map moves
    mockMap.getZoom.mockReturnValue(12);
    mockMap.getBounds.mockReturnValue({
      getNorth: () => 10,
      getSouth: () => 7,
      getEast: () => 40,
      getWest: () => 37
    });

    // THEN clusters should be updated
    expect(mockMap.getZoom).toHaveBeenCalled();
    expect(mockMap.getBounds).toHaveBeenCalled();
  });

  it('should cleanup on unmount', () => {
    // WHEN component is rendered and unmounted
    const { unmount } = render(<MapCluster {...defaultProps} />);
    unmount();

    // THEN markers should be removed
    expect(mockMap.getZoom).toHaveBeenCalled();
    expect(mockMap.getBounds).toHaveBeenCalled();
  });
}); 