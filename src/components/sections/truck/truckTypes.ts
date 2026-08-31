export interface GeologicalStrataInfo {
  depth: string;
  depthMeters: number;
  layerName: string;
  formation: string;
  grade?: string;
  mineral: string;
  color: string;
  accent: string;
}

export interface TelemetryState {
  progress: number;
  speedKmh: number;
  gear: string;
  payloadTons: number;
  heading: string;
  coordinates: {
    lat: string;
    lng: string;
    elevation: string;
  };
  scanningActive: boolean;
  discoveryActive: boolean;
  scanDepthMeters: number;
  detectedDeposit?: {
    mineral: string;
    grade: string;
    width: string;
    confidence: string;
  };
}

export const STRATA_DATA: GeologicalStrataInfo[] = [
  {
    depth: "0.0m",
    depthMeters: 0,
    layerName: "Surface Alluvium",
    formation: "Overburden & Colluvium",
    mineral: "Gravel & Sand",
    color: "#2C3440",
    accent: "#8B9BB4",
  },
  {
    depth: "-120m",
    depthMeters: 120,
    layerName: "Host Andesite Bedrock",
    formation: "Volcanic Clastic Sequence",
    mineral: "Silica Alteration",
    color: "#1F2633",
    accent: "#4A729D",
  },
  {
    depth: "-350m",
    depthMeters: 350,
    layerName: "Brecciated Sulfide Horizon",
    formation: "Hydrothermal Feeder Zone",
    mineral: "Chalcopyrite & Pyrite",
    grade: "1.8% CuEq",
    color: "#18202B",
    accent: "#3B82F6",
  },
  {
    depth: "-580m",
    depthMeters: 580,
    layerName: "Bonanza Gold-Quartz Seam",
    formation: "Epithermal Quartz Stockwork",
    mineral: "Native Gold & Electrum",
    grade: "14.2 g/t Au",
    color: "#1A170F",
    accent: "#D4AF37",
  },
];
