import { create } from "zustand";

export interface Spot {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  status: string;
  lastUpdated: string;
  measurements: {
    temperature: number;
    humidity: number;
    pressure: number;
  };
  metadata: {
    deviceId: string;
    installationDate: string;
    type: string;
  };
  images: Array<{
    id: string;
    url: string;
    caption: string;
    timestamp: string;
  }>;
}

export type DisplayMode = "table" | "custom" | "template";

interface ReportState {
  spots: Spot[];
  template: string | null;
  images: string[];
  pdfs: string[];
  displayMode: DisplayMode;
  addSpot: (spot: Spot) => void;
  setTemplate: (template: string) => void;
  addImage: (image: string) => void;
  removeImage: (index: number) => void;
  addPdf: (pdf: string) => void;
  importData: (data: any) => void;
  setDisplayMode: (mode: DisplayMode) => void;
}

export const useReportStore = create<ReportState>((set) => ({
  spots: [],
  template: null,
  images: [],
  pdfs: [],
  displayMode: "table",
  addSpot: (spot) => set((state) => ({ spots: [...state.spots, spot] })),
  setTemplate: (template) => set({ template }),
  addImage: (image) => set((state) => ({ images: [...state.images, image] })),
  removeImage: (index) =>
    set((state) => ({
      images: state.images.filter((_, i) => i !== index),
    })),
  addPdf: (pdf) => set((state) => ({ pdfs: [...state.pdfs, pdf] })),
  importData: (data) => {
    if (Array.isArray(data)) {
      set({ spots: data });
    } else if (data.spots && Array.isArray(data.spots)) {
      set({ spots: data.spots });
    }
  },
  setDisplayMode: (displayMode) => set({ displayMode }),
}));
