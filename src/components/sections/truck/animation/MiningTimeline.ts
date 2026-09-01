import * as THREE from "three";

export interface TimelinePhase {
  phaseIndex: number;
  badge: string;
  title: string;
  desc: string;
  speedKmh: number;
  gear: string;
  isScanning: boolean;
  isDiscovered: boolean;
}

/**
 * 10-Phase GSAP / ScrollTimeline Mapping Engine
 * Maps normalized scroll progress (0.0 -> 1.0) to narrative badges, vehicle speeds, and telemetry events.
 */
export class MiningTimeline {
  public static getPhase(progress: number): TimelinePhase {
    const sp = THREE.MathUtils.clamp(progress, 0, 1);

    if (sp < 0.08) {
      return {
        phaseIndex: 1,
        badge: "PHASE 01 // MOUNTAIN & PORTAL ESTABLISHING",
        title: "Wide Open-Pit Portal Establishing View",
        desc: "Cinematic wide-angle view of the reinforced underground mine portal as natural daylight illuminates the steep mountain bench.",
        speedKmh: 15,
        gear: "PORTAL APPROACH",
        isScanning: false,
        isDiscovered: false,
      };
    } else if (sp < 0.16) {
      return {
        phaseIndex: 2,
        badge: "PHASE 02 // TRUCK APPROACHING PORTAL",
        title: "Heavy CAT 797F Portal Entrance Approach",
        desc: "Camera tracks alongside the Caterpillar 797F heavy mining haul truck as dust clouds roll off its 4-meter tires.",
        speedKmh: 22,
        gear: "APPROACH HAUL",
        isScanning: false,
        isDiscovered: false,
      };
    } else if (sp < 0.28) {
      return {
        phaseIndex: 3,
        badge: "PHASE 03 // SUBTERRANEAN DRIFT TRAMMING",
        title: "Deep Cave Transit & Headlight Illumination",
        desc: "Illuminated by high-intensity headlights, the truck trams through the blasted hard-rock drift vault supported by steel arches and ventilation ducts.",
        speedKmh: 24,
        gear: "TUNNEL TRAMMING",
        isScanning: true,
        isDiscovered: false,
      };
    } else if (sp < 0.40) {
      return {
        phaseIndex: 4,
        badge: "PHASE 04 // UNDERGROUND CAVE JOURNEY",
        title: "Deep Rock Drift & Mineralized Reef",
        desc: "Navigating deep underground caverns where exposed native gold-quartz stringers streak across the structural granite face.",
        speedKmh: 20,
        gear: "DRIFT TRANSIT",
        isScanning: true,
        isDiscovered: true,
      };
    } else if (sp < 0.52) {
      return {
        phaseIndex: 5,
        badge: "PHASE 05 // ORE LOADING & REEF EXTRACTION",
        title: "Deep Reef Ore Loading Sequence",
        desc: "Underground loader scoops raw gold-bearing quartz boulders from the reef face, dumping high-grade mineralized ore into the haul truck bed.",
        speedKmh: 16,
        gear: "ORE LOADING",
        isScanning: true,
        isDiscovered: true,
      };
    } else if (sp < 0.60) {
      return {
        phaseIndex: 6,
        badge: "PHASE 06 // TRUCK TURNAROUND IN CAVERN",
        title: "360° Cavern Turnaround & Steering",
        desc: "The haul truck executes a realistic turnaround inside the subterranean cavern, steering through 360° perspective.",
        speedKmh: 14,
        gear: "CAVERN TURNAROUND",
        isScanning: true,
        isDiscovered: true,
      };
    } else if (sp < 0.68) {
      return {
        phaseIndex: 7,
        badge: "PHASE 07 // TRUCK DRIVING BACK TOWARD EXIT",
        title: "Return Transit Through Drift Vault",
        desc: "Loaded with mineralized gold-quartz ore, the heavy truck trams back toward the portal entrance under illuminated headlights.",
        speedKmh: 26,
        gear: "RETURN TRANSIT",
        isScanning: true,
        isDiscovered: true,
      };
    } else if (sp < 0.78) {
      return {
        phaseIndex: 8,
        badge: "PHASE 08 // CAVE EXIT & FALLING ORE TRAIL",
        title: "Portal Exit & Falling Ore Gravity Physics",
        desc: "Camera follows behind as the haul truck exits into daylight. Small mineral rock fragments drop under physical gravity and bounce on the road.",
        speedKmh: 32,
        gear: "PORTAL EXIT",
        isScanning: false,
        isDiscovered: false,
      };
    } else if (sp < 0.88) {
      return {
        phaseIndex: 9,
        badge: "PHASE 09 // OPEN-PIT HORIZONTAL & VERTICAL RAMP",
        title: "90° Curved Mining Ramp Ascent",
        desc: "The horizontal route transitions 90° upward into an elevated vertical mining ramp with smooth, continuous perspective.",
        speedKmh: 38,
        gear: "VERTICAL ASCENT",
        isScanning: false,
        isDiscovered: false,
      };
    } else {
      return {
        phaseIndex: 10,
        badge: "PHASE 10 // AIRCRAFT LOGISTICS & GOLD DUST TRAIL",
        title: "Industrial Cargo Flight & Mineral Release",
        desc: "Heavy industrial transport aircraft soars across sunlit mountain peaks, releasing a controlled stream of fine gold mineral dust.",
        speedKmh: 180,
        gear: "AERO DISPERSION",
        isScanning: false,
        isDiscovered: false,
      };
    }
  }
}
