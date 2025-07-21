import * as maplibregl from 'maplibre-gl';

interface LatLng {
  lat: number;
  lng: number;
}

interface DirectionsOptions {
  waypoints?: LatLng[];
  avgSpeedKmh?: number;
}

interface DisplayRouteOptions {
  showMarkers?: boolean;
  originIcon?: string | null;
  destinationIcon?: string | null;
  waypointIcon?: string | null;
  showInstructions?: boolean;
}

class DirectionsManager {
  private map: maplibregl.Map;
  private apiKey: string;
  private baseUrl: string;
  private currentRoute: any;
  private routeSource: any;
  private routeLayer: any;
  private markers: maplibregl.Marker[];
  private instructionMarkers: maplibregl.Marker[] = [];
  private _instructionPopup: maplibregl.Popup | null = null;

  constructor(map: maplibregl.Map, apiKey: string) {
    this.map = map;
    this.apiKey = apiKey;
    this.baseUrl = 'https://mapapi.gebeta.app/api/route/direction/';
    this.currentRoute = null;
    this.routeSource = null;
    this.routeLayer = null;
    this.markers = [];
    this._initRouteLayer();
  }

  private _initRouteLayer() {
    if (!this.map) return;
    if (this.map.getSource('route')) return;
    this.map.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: []
        }
      }
    });
    this.map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#007cbf',
        'line-width': 4,
        'line-opacity': 0.8
      }
    });
    this.map.addLayer({
      id: 'route-arrows',
      type: 'symbol',
      source: 'route',
      layout: {
        'symbol-placement': 'line',
        'text-field': '▶',
        'text-size': 12,
        'symbol-spacing': 50,
        'text-keep-upright': false
      },
      paint: {
        'text-color': '#007cbf',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1
      }
    });
  }

  async getDirections(origin: LatLng, destination: LatLng, options: DirectionsOptions = {}): Promise<any> {
    if (!this.apiKey) throw new Error('API key is required for directions');
    if (!origin || !destination) throw new Error('Origin and destination are required');
    const { waypoints = [], avgSpeedKmh = 30 } = options;
    const params = new URLSearchParams({
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      apiKey: this.apiKey
    });
    if (waypoints.length > 0) {
      const waypointsString = `[${waypoints.map(wp => `{${wp.lat},${wp.lng}}`).join(',')}]`;
      params.append('waypoints', waypointsString);
    }
    const response = await fetch(`${this.baseUrl}?${params.toString()}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Directions API error: ${response.status} - ${errorData.message || response.statusText}`);
    }
    const data = await response.json();
    const transformedData = this._transformApiResponse(data, origin, destination, avgSpeedKmh);
    this.currentRoute = transformedData;
    return transformedData;
  }

  private _transformApiResponse(apiResponse: any, origin: LatLng, destination: LatLng, avgSpeedKmh = 30) {
    const coordinates = apiResponse.direction || [];
    const transformedCoordinates = coordinates.map((coord: number[]) => [coord[1], coord[0]]);
    const instructions = (apiResponse.instruction || []).map((step: any) => ({
      ...step,
      coord: [step.turning_latitude, step.turning_longitude]
    }));
    return {
      ...apiResponse,
      geometry: {
        type: 'LineString',
        coordinates: transformedCoordinates
      },
      origin: { ...origin },
      destination: { ...destination },
      distance: apiResponse.totalDistance ? `${(apiResponse.totalDistance / 1000).toFixed(2)} km` : null,
      duration: apiResponse.totalDistance ? this._estimateDuration(apiResponse.totalDistance, avgSpeedKmh) : null,
      instructions
    };
  }

  private _estimateDuration(distanceMeters: number, avgSpeedKmh = 30): string {
    const distanceKm = distanceMeters / 1000;
    const durationHours = distanceKm / avgSpeedKmh;
    const durationMinutes = Math.round(durationHours * 60);
    if (durationMinutes < 60) {
      return `${durationMinutes} min`;
    } else {
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  }

  displayRoute(routeData: any, options: DisplayRouteOptions = {}) {
    if (!this.map || !routeData) return;
    const {
      showMarkers = true,
      originIcon = null,
      destinationIcon = null,
      waypointIcon = null,
      showInstructions = false
    } = options;
    this.clearRoute();
    if (routeData.geometry && routeData.geometry.coordinates) {
      (this.map.getSource('route') as maplibregl.GeoJSONSource).setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: routeData.geometry.coordinates
        }
      });
    }
    if (showMarkers) {
      this._addRouteMarkers(routeData, { originIcon, destinationIcon, waypointIcon });
    }
    if (showInstructions && Array.isArray(routeData.instructions) && routeData.instructions.length > 0) {
      this._addInstructionMarkers(routeData.instructions);
    }
    this._fitMapToRoute(routeData);
  }

  private _addRouteMarkers(routeData: any, options: any = {}) {
    const {
      originIcon = 'https://cdn-icons-png.flaticon.com/512/1828/1828640.png',
      destinationIcon = 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png',
      waypointIcon = 'https://cdn-icons-png.flaticon.com/512/484/484167.png'
    } = options;
    this._clearMarkers();
    if (routeData.origin) {
      const originMarker = this._addMarker(
        [routeData.origin.lng, routeData.origin.lat],
        originIcon,
        'Origin',
        [25, 25]
      );
      this.markers.push(originMarker);
    }
    if (routeData.destination) {
      const destMarker = this._addMarker(
        [routeData.destination.lng, routeData.destination.lat],
        destinationIcon,
        'Destination',
        [25, 25]
      );
      this.markers.push(destMarker);
    }
    if (routeData.waypoints && routeData.waypoints.length > 0) {
      routeData.waypoints.forEach((waypoint: any, index: number) => {
        const waypointMarker = this._addMarker(
          [waypoint.lng, waypoint.lat],
          waypointIcon,
          `Waypoint ${index + 1}`,
          [20, 20]
        );
        this.markers.push(waypointMarker);
      });
    }
  }

  private _addMarker(lngLat: [number, number], iconUrl: string, title: string, size: [number, number] = [30, 30]): maplibregl.Marker {
    const el = document.createElement('div');
    el.style.backgroundImage = `url('${iconUrl}')`;
    el.style.backgroundSize = 'contain';
    el.style.backgroundRepeat = 'no-repeat';
    el.style.width = `${size[0]}px`;
    el.style.height = `${size[1]}px`;
    el.style.cursor = 'pointer';
    el.title = title;
    const marker = new maplibregl.Marker({ element: el })
      .setLngLat(lngLat)
      .addTo(this.map);
    return marker;
  }

  private _fitMapToRoute(routeData: any) {
    if (!this.map || !routeData.geometry) return;
    const coordinates = routeData.geometry.coordinates;
    if (coordinates.length === 0) return;
    const bounds = new maplibregl.LngLatBounds();
    coordinates.forEach((coord: [number, number]) => {
      bounds.extend(coord);
    });
    this.map.fitBounds(bounds, {
      padding: 50,
      duration: 1000
    });
  }

  clearRoute() {
    if (!this.map) return;
    (this.map.getSource('route') as maplibregl.GeoJSONSource).setData({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: []
      }
    });
    this._clearMarkers();
    if (this.instructionMarkers) {
      this.instructionMarkers.forEach(marker => marker.remove());
      this.instructionMarkers = [];
    }
    if (this._instructionPopup) {
      this._instructionPopup.remove();
      this._instructionPopup = null;
    }
    this.currentRoute = null;
  }

  private _clearMarkers() {
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
  }

  getCurrentRoute() {
    return this.currentRoute;
  }

  getRouteSummary() {
    if (!this.currentRoute) return null;
    return {
      distance: this.currentRoute.distance,
      duration: this.currentRoute.duration,
      totalDistance: this.currentRoute.totalDistance,
      timeTaken: this.currentRoute.timetaken,
      origin: this.currentRoute.origin,
      destination: this.currentRoute.destination,
      waypoints: this.currentRoute.waypoints || []
    };
  }

  updateRouteStyle(style: { color?: string; width?: number; opacity?: number } = {}) {
    if (!this.map) return;
    const {
      color = '#007cbf',
      width = 4,
      opacity = 0.8
    } = style;
    this.map.setPaintProperty('route', 'line-color', color);
    this.map.setPaintProperty('route', 'line-width', width);
    this.map.setPaintProperty('route', 'line-opacity', opacity);
  }

  private _addInstructionMarkers(instructions: any[]) {
    if (!this.map) return;
    if (!this.instructionMarkers) this.instructionMarkers = [];
    this.instructionMarkers.forEach(marker => marker.remove());
    this.instructionMarkers = [];
    instructions.forEach((step: any, idx: number) => {
      if (!step.coord || step.coord.length !== 2) return;
      const [lat, lng] = step.coord;
      const el = document.createElement('div');
      el.style.background = '#007cbf';
      el.style.color = 'white';
      el.style.borderRadius = '50%';
      el.style.width = '28px';
      el.style.height = '28px';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.fontWeight = 'bold';
      el.style.fontSize = '15px';
      el.style.border = '2px solid #fff';
      el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.15)';
      el.innerText = (idx + 1).toString();
      el.style.cursor = 'pointer';
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(this.map);
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.map.flyTo({ center: [lng, lat], zoom: 17, speed: 1.2 });
        if (this._instructionPopup) this._instructionPopup.remove();
        this._instructionPopup = new maplibregl.Popup({ offset: 18, closeButton: false })
          .setLngLat([lng, lat])
          .setHTML(
            `<div style="font-size:14px; color:#666; width:max-content; border-radius:5%; padding:4px 8px;">
              ${step.path || ''} (~${Math.round(step.distance)}m)
            </div>`
          )
          .addTo(this.map);
      });
      this.instructionMarkers.push(marker);
    });
  }
}

export default DirectionsManager; 