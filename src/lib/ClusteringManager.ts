import Supercluster from 'supercluster';
import type { Map as MapLibreMap, Marker as MaplibreMarker } from 'maplibre-gl';
import type { Feature, Point } from 'geojson';
import * as maplibregl from 'maplibre-gl';

export type ClusteredMarkerData = {
  id: string;
  lngLat: [number, number];
  imageUrl: string;
  size?: [number, number];
  onClick?: (lngLat: [number, number], marker: MaplibreMarker, event: MouseEvent) => void;
};

export type ClusteringOptions = {
  radius?: number;
  maxZoom?: number;
  clusterImage?: string | null;
  clusterOnClick?: ((cluster: any, event: MouseEvent) => void) | null;
  showClusterCount?: boolean;
  enabled?: boolean;
};

class ClusteringManager {
  private map: MapLibreMap;
  private options: ClusteringOptions;
  private markers: ClusteredMarkerData[] = [];
  private supercluster: Supercluster;
  private renderedMarkers: Map<string, MaplibreMarker> = new Map();
  private renderedClusters: Map<number, MaplibreMarker> = new Map();
  private enabled: boolean;

  constructor(map: MapLibreMap, options: ClusteringOptions = {}) {
    this.map = map;
    this.options = {
      radius: options.radius || 50,
      maxZoom: options.maxZoom || 16,
      clusterImage: options.clusterImage || null,
      clusterOnClick: options.clusterOnClick || null,
      showClusterCount: options.showClusterCount || false,
      ...options
    };
    // If options are passed, default enabled to true unless explicitly set to false
    this.enabled = typeof options.enabled === 'boolean' ? options.enabled : Object.keys(options).length > 0;
    this.supercluster = new Supercluster({
      radius: this.options.radius,
      maxZoom: this.options.maxZoom,
    });
    this.setupEventListeners();
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.clearRenderedElements();
    } else {
      this.updateClustering();
    }
  }

  private setupEventListeners() {
    this.map.on('moveend', () => this.updateClustering());
    this.map.on('zoomend', () => this.updateClustering());
  }

  /** Add a marker to the cluster manager. */
  public addMarker(marker: ClusteredMarkerData) {
    this.markers.push(marker);
    this.updateClustering();
    return marker;
  }

  /** Remove a marker by ID. */
  public removeMarker(markerId: string) {
    this.markers = this.markers.filter(m => m.id !== markerId);
    this.updateClustering();
  }

  /** Remove all clustered markers. */
  public clearAllMarkers() {
    this.markers = [];
    this.clearRenderedElements();
  }

  private clearRenderedElements() {
    this.renderedMarkers.forEach(marker => marker.remove());
    this.renderedMarkers.clear();
    this.renderedClusters.forEach(cluster => cluster.remove());
    this.renderedClusters.clear();
  }

  /** Update clustering and render clusters/markers. */
  public updateClustering() {
    if (!this.enabled) {
      this.clearRenderedElements();
      return;
    }
    if (!this.map || this.markers.length === 0) {
      this.clearRenderedElements();
      return;
    }
    this.clearRenderedElements();
    const bounds = this.map.getBounds();
    const zoom = Math.floor(this.map.getZoom());
    const points: Feature<Point>[] = this.markers.map(marker => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: marker.lngLat },
      properties: {
        markerId: marker.id,
        imageUrl: marker.imageUrl,
        size: marker.size,
        onClick: marker.onClick
      }
    }));
    this.supercluster.load(points);
    const clusters = this.supercluster.getClusters(
      [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
      zoom
    );
    clusters.forEach(cluster => {
      if ((cluster.properties as any).cluster) {
        this.renderCluster(cluster);
      } else {
        this.renderIndividualMarker(cluster);
      }
    });
  }

  private renderCluster(cluster: any) {
    const el = document.createElement('div');
    el.className = 'cluster-marker';
    if (this.options.clusterImage) {
      el.style.cssText = `
        background-image: url('${this.options.clusterImage}');
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        width: 40px;
        height: 40px;
        cursor: pointer;
        position: relative;
      `;
      if (this.options.showClusterCount) {
        const countEl = document.createElement('div');
        countEl.style.cssText = `
          position: absolute;
          top: -5px;
          right: -5px;
          background-color: #ff4444;
          color: white;
          font-weight: bold;
          font-size: 10px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          line-height: 1;
        `;
        countEl.textContent = cluster.properties.point_count;
        el.appendChild(countEl);
      }
    } else {
      el.style.cssText = `
        background-color: #51bbd6;
        border-radius: 50%;
        color: white;
        font-weight: bold;
        text-align: center;
        line-height: 40px;
        width: 40px;
        height: 40px;
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      `;
      el.textContent = cluster.properties.point_count;
    }
    const marker = new maplibregl.Marker({ element: el })
      .setLngLat(cluster.geometry.coordinates)
      .addTo(this.map);
    this.renderedClusters.set(cluster.id, marker);
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.options.clusterOnClick) {
        this.options.clusterOnClick(cluster, e);
      } else {
        const expansionZoom = this.supercluster.getClusterExpansionZoom(cluster.id);
        this.map.easeTo({
          center: cluster.geometry.coordinates,
          zoom: expansionZoom
        });
      }
    });
  }

  private renderIndividualMarker(cluster: any) {
    const markerData = this.markers.find(m => m.id === cluster.properties.markerId);
    if (!markerData) return;
    const el = document.createElement('div');
    el.style.backgroundImage = `url('${markerData.imageUrl}')`;
    el.style.backgroundSize = 'contain';
    el.style.backgroundRepeat = 'no-repeat';
    el.style.width = `${markerData.size ? markerData.size[0] : 32}px`;
    el.style.height = `${markerData.size ? markerData.size[1] : 32}px`;
    el.style.cursor = 'pointer';
    const mapMarker = new maplibregl.Marker({ element: el })
      .setLngLat(markerData.lngLat)
      .addTo(this.map);
    this.renderedMarkers.set(markerData.id, mapMarker);
    if (markerData.onClick) {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        markerData.onClick(markerData.lngLat, mapMarker, e);
      });
    }
  }

  public setClusterImage(imageUrl: string) {
    this.options.clusterImage = imageUrl;
    this.updateClustering();
  }
}

export default ClusteringManager; 