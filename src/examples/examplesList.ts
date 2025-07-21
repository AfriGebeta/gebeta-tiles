import CustomMarkersExample from "src/examples/CustomMarkersExample";
import FenceExample from "src/examples/FenceExample";
import PolypathExample from "src/examples/PolypathExample";
import ClusteringExample from "src/examples/ClusteringExample";
import GeocodingExample from "src/examples/GeocodingExample";
import DirectionsExample from "src/examples/DirectionsExample";

export const examples = [
  {
    title: "Custom Markers Example",
    description: "Click to add default or custom markers with random icons.",
    component: CustomMarkersExample,
  },
  {
    title: "Fence Drawing Example",
    description: "Draw, close, and clear polygonal fences interactively.",
    component: FenceExample,
  },
  {
    title: "Polypath Example",
    description: "Draw a path between two points you select on the map.",
    component: PolypathExample,
  },
  {
    title: "Marker Clustering Example",
    description: "Add random markers and see them cluster as you zoom out.",
    component: ClusteringExample,
  },{
      title: "Geocoding Example",
    description: "Search for places by name or coordinates and see results on the map.",
    component: GeocodingExample,
  },
  {
    title: "Directions Example",
    description: "Get directions between two points, view route and step-by-step instructions.",
    component: DirectionsExample,
  },
]; 