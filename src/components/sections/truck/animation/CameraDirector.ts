import * as THREE from "three";

export interface CameraFrame {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
  up?: THREE.Vector3;
  fov: number;
}

/**
 * Cinematic Multi-Angle Camera Director
 * Inspired by the interaction style of unitedcarriers.com:
 * 1. Wide Establishing Approach (sp: 0.00 – 0.22) -> Approach DISCOVERY
 * 2. Low Side Profile Highway Tracking (sp: 0.22 – 0.45) -> Pass over EXPLORATION
 * 3. Rear 3/4 Dynamic Chase with Dust Vortex (sp: 0.45 – 0.68) -> Pass over EXTRACTION
 * 4. Elevated Aerial Bird's-Eye Perspective (sp: 0.68 – 0.88) -> Overhead across INTELLIGENCE
 * 5. Forward Horizon Exit (sp: 0.88 – 1.00) -> Open Mining Highway Cruise
 */
export class CameraDirector {
  private tempPos: THREE.Vector3 = new THREE.Vector3();
  private tempLookAt: THREE.Vector3 = new THREE.Vector3();
  private standardUp: THREE.Vector3 = new THREE.Vector3(0, 1, 0);

  public getFrame(
    sp: number,
    truckPos: THREE.Vector3,
    _aircraftPos: THREE.Vector3,
    _mouseX: number,
    _mouseY: number
  ): CameraFrame {
    if (sp < 0.35) {
      // Phase 1: Straight, level, perpendicular profile view - horizon is 100% level and straight
      this.tempPos.set(
        truckPos.x + 1.0,
        2.4,
        38.0
      );

      this.tempLookAt.set(
        truckPos.x + 1.0,
        2.2,
        0.0
      );

      return {
        position: this.tempPos,
        lookAt: this.tempLookAt,
        up: this.standardUp,
        fov: 38,
      };
    } else if (sp < 0.70) {
      // Phase 2: Centered level trailing view behind the truck in the cave (pulled further back)
      this.tempPos.set(
        truckPos.x - 44.0,
        3.8,
        0.0
      );

      this.tempLookAt.set(
        truckPos.x + 12.0,
        2.6,
        0.0
      );

      return {
        position: this.tempPos,
        lookAt: this.tempLookAt,
        up: this.standardUp,
        fov: 38,
      };
    } else if (sp < 0.78) {
      // Phase 3A: Pinned Side Profile Level Highway Tracking (media_1788425794284.png)
      this.tempPos.set(
        truckPos.x + 1.0,
        2.4,
        34.0
      );

      this.tempLookAt.set(
        truckPos.x + 1.0,
        2.0,
        0.0
      );

      return {
        position: this.tempPos,
        lookAt: this.tempLookAt,
        up: this.standardUp,
        fov: 34,
      };
    } else {
      // Phase 3B & 3C: Top-Down Vertical Road View Across 3 Milestones
      const topDownUp = new THREE.Vector3(0, 0, -1);

      if (sp < 0.84) {
        // Smooth cinematic transition into top-down pinned angle
        const t = (sp - 0.78) / 0.06;
        const smoothT = THREE.MathUtils.smoothstep(t, 0, 1);

        const startPos = new THREE.Vector3(truckPos.x + 1.0, 2.4, 34.0);
        const endPos = new THREE.Vector3(truckPos.x, 38.0, truckPos.z);
        this.tempPos.lerpVectors(startPos, endPos, smoothT);

        const startLook = new THREE.Vector3(truckPos.x + 1.0, 2.0, 0.0);
        const endLook = new THREE.Vector3(truckPos.x, 0.0, truckPos.z);
        this.tempLookAt.lerpVectors(startLook, endLook, smoothT);

        const blendUp = new THREE.Vector3(0, 1, 0).lerp(topDownUp, smoothT).normalize();

        return {
          position: this.tempPos,
          lookAt: this.tempLookAt,
          up: blendUp,
          fov: 34,
        };
      } else {
        // PINNED CAMERA ANGLE: Rock-solid locked X-axis (x = 185.0, y = 38.0) tracking ONLY loader along Z
        this.tempPos.set(185.0, 38.0, truckPos.z);
        this.tempLookAt.set(185.0, 0.0, truckPos.z);

        return {
          position: this.tempPos,
          lookAt: this.tempLookAt,
          up: topDownUp,
          fov: 34,
        };
      }
    }
  }
}
