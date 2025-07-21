class GeocodingManager {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://mapapi.gebeta.app/api/v1/route';
  }

  /**
   * Forward geocoding: search by name.
   * @param name
   * @returns Promise<any[]>
   */
  async geocode(name: string): Promise<any[]> {
    if (!this.apiKey) throw new Error('API key is required for geocoding');
    if (!name) throw new Error('Name is required for geocoding');
    const params = new URLSearchParams({ name, apiKey: this.apiKey });
    const url = `${this.baseUrl}/geocoding?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();
    if (response.ok && data.msg === 'ok') return data.data;
    throw new Error(data.error?.message || data.msg || 'Geocoding failed');
  }

  /**
   * Reverse geocoding: search by coordinates.
   * @param lat
   * @param lon
   * @returns Promise<any[]>
   */
  async reverseGeocode(lat: number, lon: number): Promise<any[]> {
    if (!this.apiKey) throw new Error('API key is required for reverse geocoding');
    if (lat == null || lon == null) throw new Error('Latitude and longitude are required');
    const params = new URLSearchParams({ lat: lat.toString(), lon: lon.toString(), apiKey: this.apiKey });
    const url = `${this.baseUrl}/revgeocoding?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();
    if (response.ok && data.msg === 'ok') return data.data;
    throw new Error(data.error?.message || data.msg || 'Reverse geocoding failed');
  }
}

export default GeocodingManager; 