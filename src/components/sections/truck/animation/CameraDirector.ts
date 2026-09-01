import * as THREE from "three";

export interface CameraFrame {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
  fov: number;
}

/**
 * Camera Director Architecture
 * Phase 1 (sp < 0.35): Open road approach view framing haul truck driving across open road
 * Phase 2 (0.35 <= sp < 0.85): Centered trailing view directly behind truck inside cavern tunnel (z = 0.0)
 * Phase 3 (sp >= 0.85): Tracking perspective following main haul truck emerging from cave exit portal into daylight
 */
export class CameraDirector {
  private tempPos: THREE.Vector3 = new THREE.Vector3();
  private tempLookAt: THREE.Vector3 = new THREE.Vector3();

  public getFrame(
    sp: number,
    truckPos: THREE.Vector3,
    aircraftPos: THREE.Vector3,
    mouseX: number,
    mouseY: number
  ): CameraFrame {
    if (sp < 0.35) {
      // Phase 1: Open road approach shot
      this.tempPos.set(
        truckPos.x - 2.0,
        4.8 + mouseY * 1.5,
        52 + mouseX * 2.0
      );

      this.tempLookAt.set(
        truckPos.x + 6.0,
        2.4,
        0
      );

      return {
        position: this.tempPos,
        lookAt: this.tempLookAt,
        fov: 42,
      };
    } else if (sp < 0.85) {
      // Phase 2: EXACTLY BEHIND THE TRUCK (z = 0.0) inside cave tunnel
      this.tempPos.set(
        truckPos.x - 36.0 + mouseY * 0.8,
        4.2 + mouseY * 0.8,
        0.0 + mouseX * 1.0
      );

      this.tempLookAt.set(
        truckPos.x + 20.0,
        3.2,
        0.0
      );

      return {
        position: this.tempPos,
        lookAt: this.tempLookAt,
        fov: 38,
      };
    } else {
      // Phase 3: Daylight exit tracking camera view
      this.tempPos.set(
        truckPos.x - 6.0 + mouseX * 1.5,
        4.8 + mouseY * 1.5,
        32.0 + mouseX * 2.0
      );

      this.tempLookAt.set(
        truckPos.x + 8.0,
        2.4,
        0.0
      );

      return {
        position: this.tempPos,
        lookAt: this.tempLookAt,
        fov: 42,
      };
    }
  }
}
