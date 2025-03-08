import '@testing-library/jest-dom';

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn();

// Mock maplibre-gl
jest.mock('maplibre-gl', () => ({
  Map: jest.fn(),
  Marker: jest.fn().mockImplementation(() => ({
    setLngLat: jest.fn().mockReturnThis(),
    addTo: jest.fn().mockReturnThis(),
    remove: jest.fn(),
    _getUIString: jest.fn()
  }))
})); 