import * as THREE from "three";

export interface CameraState {
  targetPos: THREE.Vector3;
  lookAt: THREE.Vector3;
}

/**
 * 12-Shot Cinematic Camera Director
 * Interpolates camera position and focus target smoothly across the 10-phase scroll timeline.
 */
export function getCameraFrame(
  scrollProgress: number,
  truckPos: THREE.Vector3,
  aircraftPos: THREE.Vector3,
  mouseX: number,
  mouseY: number
): CameraState {
  const sp = THREE.MathUtils.clamp(scrollProgress, 0, 1);
  const targetPos = new THREE.Vector3();
  const lookAt = new THREE.Vector3();

  if (sp < 0.08) {
    // SHOT 01: Mountain & Mine Entrance Establishing Shot
    const t = sp / 0.08;
    targetPos.set(-14, 5.5, THREE.MathUtils.lerp(36, 24, t));
    lookAt.set(0, 2.0, truckPos.z);
  } else if (sp < 0.18) {
    // SHOT 02: Truck Approaches Mine Entrance
    const t = (sp - 0.08) / 0.1;
    targetPos.set(-12, 4.8, THREE.MathUtils.lerp(24, 12, t));
    lookAt.set(truckPos.x, 2.0, truckPos.z);
  } else if (sp < 0.30) {
    // SHOT 03: Front 3/4 & Side Tracking Entering Tunnel
    const t = (sp - 0.18) / 0.12;
    targetPos.set(-11, 4.2, truckPos.z + 10);
    lookAt.set(truckPos.x, 2.0, truckPos.z - 2.0);
  } else if (sp < 0.42) {
    // SHOT 04: Underground Cave Drift Tramming with Headlight Beams
    const t = (sp - 0.30) / 0.12;
    targetPos.set(-9.5, 3.8, truckPos.z + 8);
    lookAt.set(truckPos.x, 2.0, truckPos.z - 3.0);
  } else if (sp < 0.52) {
    // SHOT 05: Underground Extraction Reef Face & Ore Loading
    const t = (sp - 0.42) / 0.1;
    targetPos.set(-7.5, 3.5, truckPos.z + 6);
    lookAt.set(truckPos.x, 2.2, truckPos.z);
  } else if (sp < 0.62) {
    // SHOT 06: Realistic Truck 360° Turnaround Inside Cave
    const t = (sp - 0.52) / 0.1;
    targetPos.set(
      Math.sin(t * Math.PI * 2) * 12 - 6,
      4.2,
      truckPos.z + Math.cos(t * Math.PI * 2) * 12
    );
    lookAt.set(truckPos.x, 2.0, truckPos.z);
  } else if (sp < 0.72) {
    // SHOT 07: Truck Exits Mine with Physical Falling Gold Ore Trail
    const t = (sp - 0.62) / 0.1;
    targetPos.set(-12, 4.5, truckPos.z - 8);
    lookAt.set(truckPos.x, 2.0, truckPos.z);
  } else if (sp < 0.80) {
    // SHOT 08: Open-Pit Mine Horizontal Haul Road Transit
    const t = (sp - 0.72) / 0.08;
    targetPos.set(-16, 6.0, truckPos.z + 6);
    lookAt.set(truckPos.x, 2.5, truckPos.z);
  } else if (sp < 0.88) {
    // SHOT 09: 90° Vertical Curved Ramp Ascent Transition
    const t = (sp - 0.80) / 0.08;
    targetPos.set(-14, truckPos.y + 4.0, truckPos.z - 6.0);
    lookAt.set(0, truckPos.y + 2.0, truckPos.z);
  } else {
    // SHOT 10: Industrial Cargo Aircraft Flight Sequence
    targetPos.set(
      aircraftPos.x - 14 - mouseX * 2.5,
      aircraftPos.y + 6.0 - mouseY * 2.0,
      aircraftPos.z - 16
    );
    lookAt.set(aircraftPos.x, aircraftPos.y - 2.0, aircraftPos.z + 6);
  }

  // Interactive Cursor Parallax Offset
  targetPos.x += mouseX * 2.2;
  targetPos.y += mouseY * 1.4;

  return { targetPos, lookAt };
}
