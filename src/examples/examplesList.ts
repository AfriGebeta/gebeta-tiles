import CustomMarkersExample from "src/examples/CustomMarkersExample";
import FenceExample from "src/examples/FenceExample";
import PolypathExample from "src/examples/PolypathExample";

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
]; 