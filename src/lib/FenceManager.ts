import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import type { Feature, Polygon, LineString } from "geojson";

export type FencePoint = [number, number];
export type Fence = {
  id: number;
  points: FencePoint[];
  markers: Marker[];
  sourceId: string;
  layerId: string;
};

/**
 * Manages drawing and storing polygonal fences on a maplibre-gl map.
 */
class FenceManager {
  private map: MapLibreMap;
  private fencePoints: FencePoint[] = [];
  private fenceMarkerList: Marker[] = [];
  private _isDrawingFence = false;
  private fences: Fence[] = [];
  private currentFenceId = 0;
  private readonly fenceSourceId = "fence";
  private readonly fenceLayerId = "fence-fill";
  private readonly dynamicPolylineSourceId = "dynamic-fence";
  private readonly dynamicPolylineLayerId = "dynamic-fence-line";

  constructor(map: MapLibreMap) {
    this.map = map;
  }

  /**
   * Add a point to the current fence. If the fence is completed and the click is outside, starts a new fence.
   * @param lngLat The [lng, lat] of the point.
   * @param customImage Optional custom marker image URL.
   * @param onClick Optional click handler for the marker.
   * @param addImageMarkerCallback Callback to add a marker to the map.
   */
  public addFencePoint(
    lngLat: FencePoint,
    customImage: string | null = null,
    onClick: ((lngLat: FencePoint, marker: Marker, event: MouseEvent) => void) | null = null,
    addImageMarkerCallback: (
      lngLat: FencePoint,
      imageUrl: string,
      size: [number, number],
      onClick?: (lngLat: FencePoint, marker: Marker, event: MouseEvent) => void
    ) => { marker: Marker }
  ) {
    if (!this.map) throw new Error("Map not initialized.");
    if (this.isFenceCompleted() && !this.isPointInsideFence(lngLat)) {
      this.startNewFence();
    }
    if (this._isDrawingFence && this.isClickOnExistingFencePoint(lngLat)) {
      this.closeFence();
      return;
    }
    this.fencePoints.push(lngLat);
    const markerImage = customImage || "https://cdn-icons-png.flaticon.com/512/484/484167.png";
    const { marker } = addImageMarkerCallback(lngLat, markerImage, [30, 30], onClick || undefined);
    this.fenceMarkerList.push(marker);
    if (this.fencePoints.length >= 3) {
      this.drawFence();
    }
    if (this.fencePoints.length === 1) {
      this.startFenceDrawing();
    }
  }

  /** Start drawing mode for a new fence. */
  public startFenceDrawing() {
    if (!this.map) return;
    this._isDrawingFence = true;
    this.map.addSource(this.dynamicPolylineSourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: { type: "LineString", coordinates: [] },
        properties: {},
      } as Feature<LineString>,
    });
    this.map.addLayer({
      id: this.dynamicPolylineLayerId,
      type: "line",
      source: this.dynamicPolylineSourceId,
      paint: {
        "line-color": "#ff0000",
        "line-width": 2,
        "line-dasharray": [2, 2],
      },
    });
    this.map.on("mousemove", this.updateDynamicPolyline);
  }

  private updateDynamicPolyline = (e: any) => {
    if (!this._isDrawingFence || this.fencePoints.length === 0) return;
    const currentPoint: FencePoint = [e.lngLat.lng, e.lngLat.lat];
    const coordinates = [...this.fencePoints, currentPoint];
    (this.map.getSource(this.dynamicPolylineSourceId) as any).setData({
      type: "Feature",
      geometry: { type: "LineString", coordinates },
      properties: {},
    } as Feature<LineString>);
  };

  /** Stop drawing mode and remove dynamic polyline. */
  public stopFenceDrawing() {
    if (!this.map) return;
    this._isDrawingFence = false;
    if (this.map.getLayer(this.dynamicPolylineLayerId)) {
      this.map.removeLayer(this.dynamicPolylineLayerId);
    }
    if (this.map.getSource(this.dynamicPolylineSourceId)) {
      this.map.removeSource(this.dynamicPolylineSourceId);
    }
    this.map.off("mousemove", this.updateDynamicPolyline);
  }

  /** Close the current fence if it has at least 3 points. */
  public closeFence() {
    if (this.fencePoints.length < 3) return;
    this.drawFence();
    this.stopFenceDrawing();
  }

  /** Start a new fence, storing the current one if completed. */
  public startNewFence() {
    if (this.isFenceCompleted()) {
      const completedFence: Fence = {
        id: this.currentFenceId++,
        points: [...this.fencePoints],
        markers: [...this.fenceMarkerList],
        sourceId: `${this.fenceSourceId}-${this.currentFenceId}`,
        layerId: `${this.fenceLayerId}-${this.currentFenceId}`,
      };
      this.fences.push(completedFence);
      this.fencePoints = [];
      this.fenceMarkerList = [];
      this.stopFenceDrawing();
      this.drawAllFences();
    }
  }

  /** Clear the current fence. */
  public clearFence() {
    if (!this.map) return;
    this.fencePoints = [];
    if (this.map.getSource(this.fenceSourceId)) {
      this.map.removeLayer(this.fenceLayerId);
      this.map.removeSource(this.fenceSourceId);
    }
    this.fenceMarkerList.forEach((marker) => marker.remove());
    this.fenceMarkerList = [];
    this.stopFenceDrawing();
  }

  /** Clear all fences, including stored ones. */
  public clearAllFences() {
    if (!this.map) return;
    this.clearFence();
    this.fences.forEach((fence) => {
      if (this.map.getSource(fence.sourceId)) {
        this.map.removeLayer(fence.layerId);
        this.map.removeSource(fence.sourceId);
      }
      fence.markers.forEach((marker) => marker.remove());
    });
    this.fences = [];
    this.currentFenceId = 0;
  }

  /** Draw the current fence as a polygon. */
  public drawFence() {
    if (this.fencePoints.length < 3) return;
    const polygon = [[...this.fencePoints, this.fencePoints[0]]];
    const geojson: Feature<Polygon> = {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: polygon },
      properties: {},
    };
    if (this.map.getSource(this.fenceSourceId)) {
      (this.map.getSource(this.fenceSourceId) as any).setData(geojson);
    } else {
      this.map.addSource(this.fenceSourceId, { type: "geojson", data: geojson });
      this.map.addLayer({
        id: this.fenceLayerId,
        type: "fill",
        source: this.fenceSourceId,
        layout: {},
        paint: { "fill-color": "#ff0000", "fill-opacity": 0.3 },
      });
    }
  }

  /** Draw all stored fences and the current fence. */
  public drawAllFences() {
    this.fences.forEach((fence) => this.drawStoredFence(fence));
    if (this.fencePoints.length >= 3) {
      this.drawFence();
    }
  }

  private drawStoredFence(fence: Fence) {
    if (fence.points.length < 3) return;
    const polygon = [[...fence.points, fence.points[0]]];
    const geojson: Feature<Polygon> = {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: polygon },
      properties: {},
    };
    if (this.map.getSource(fence.sourceId)) {
      (this.map.getSource(fence.sourceId) as any).setData(geojson);
    } else {
      this.map.addSource(fence.sourceId, { type: "geojson", data: geojson });
      this.map.addLayer({
        id: fence.layerId,
        type: "fill",
        source: fence.sourceId,
        layout: {},
        paint: { "fill-color": "#ff0000", "fill-opacity": 0.3 },
      });
    }
  }

  /** Returns true if the current fence is completed (>=3 points and not drawing). */
  public isFenceCompleted() {
    return this.fencePoints.length >= 3 && !this._isDrawingFence;
  }

  /** Returns true if the given point is inside the current fence. */
  public isPointInsideFence(lngLat: FencePoint) {
    if (this.fencePoints.length < 3) return false;
    const x = lngLat[0];
    const y = lngLat[1];
    let inside = false;
    for (let i = 0, j = this.fencePoints.length - 1; i < this.fencePoints.length; j = i++) {
      const xi = this.fencePoints[i][0];
      const yi = this.fencePoints[i][1];
      const xj = this.fencePoints[j][0];
      const yj = this.fencePoints[j][1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  }

  /** Returns true if the click is near any existing fence point. */
  public isClickOnExistingFencePoint(lngLat: FencePoint) {
    for (let i = 0; i < this.fencePoints.length; i++) {
      const point = this.fencePoints[i];
      const distance = this.calculateDistance(lngLat, point);
      if (distance < 0.0005) {
        return true;
      }
    }
    return false;
  }

  private calculateDistance(point1: FencePoint, point2: FencePoint) {
    const dx = point1[0] - point2[0];
    const dy = point1[1] - point2[1];
    return Math.sqrt(dx * dx + dy * dy);
  }

  /** Get the current fence points. */
  public getFencePoints() {
    return this.fencePoints;
  }

  /** Get all stored fences. */
  public getFences() {
    return this.fences;
  }

  /** Returns true if currently in drawing mode. */
  public isDrawingFence() {
    return this._isDrawingFence;
  }
}

export default FenceManager; 