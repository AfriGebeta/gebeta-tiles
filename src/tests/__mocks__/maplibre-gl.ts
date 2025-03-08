type MockMapInstance = {
  on: jest.Mock;
  remove: jest.Mock;
  removeControl: jest.Mock;
  transformRequest: jest.Mock;
  options?: any;
};

const mockMapInstance = {
  on: jest.fn(),
  remove: jest.fn(),
  removeControl: jest.fn(),
  transformRequest: jest.fn((url, resourceType) => {
    if (resourceType === 'Tile' && url.includes('api.gebeta.app')) {
      const urlObject = new URL(url);
      urlObject.searchParams.append('key', 'test-api-key');
      return {
        url: urlObject.toString(),
        headers: {},
        credentials: 'same-origin'
      };
    }
    return { url };
  }),
  options: {}
};

const mockAttributionControl = jest.fn().mockImplementation(() => ({
  remove: jest.fn()
}));

type MockMapConstructor = {
  new (options: any): MockMapInstance;
  AttributionControl: typeof mockAttributionControl;
} & jest.Mock;

const MockMap = jest.fn().mockImplementation((options) => {
  mockMapInstance.options = options;
  return mockMapInstance;
}) as unknown as MockMapConstructor;

MockMap.AttributionControl = mockAttributionControl;

module.exports = {
  Map: MockMap,
  AttributionControl: mockAttributionControl,
  __mockInstance: mockMapInstance
}; 