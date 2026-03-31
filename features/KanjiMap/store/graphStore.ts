import { create } from "zustand";
import { persist } from "zustand/middleware";

type GraphStyle = "2D" | "3D";

interface GraphPreferenceState {
  style: GraphStyle;
  rotate: boolean;
  outLinks: boolean;
  particles: boolean;
  setStyle: (style: GraphStyle) => void;
  setRotate: (rotate: boolean) => void;
  setOutLinks: (outLinks: boolean) => void;
  setParticles: (particles: boolean) => void;
}

export const useGraphStore = create<GraphPreferenceState>()(
  persist(
    (set) => ({
      style: "3D",
      rotate: true,
      outLinks: true,
      particles: true,
      setStyle: (style) => set({ style }),
      setRotate: (rotate) => set({ rotate }),
      setOutLinks: (outLinks) => set({ outLinks }),
      setParticles: (particles) => set({ particles }),
    }),
    {
      name: "kanji-map-graph-preference",
    },
  ),
);
