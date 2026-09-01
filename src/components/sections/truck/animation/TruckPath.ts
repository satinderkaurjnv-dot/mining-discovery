import * as THREE from "three";

export interface PathTransform {
  position: THREE.Vector3;
  orientation: THREE.Quaternion;
  steeringAngle: number;
}

/**
 * Continuous Forward Path Engine
 * Main Haul Truck drives CONTINUOUSLY STRAIGHT FORWARD along +X axis (z = 0.0)
 * Open road approach: x = -48 -> 0 (0.00 <= sp < 0.35)
 * Continuous cavern transit: x = 0 -> 70 (0.35 <= sp < 0.85)
 * Daylight exit drive: x = 70 -> 100 (0.85 <= sp <= 1.0)
 */
export class TruckPath {
  public getTransform(sp: number): PathTransform {
    const clampedSp = THREE.MathUtils.clamp(sp, 0, 1);
    
    // Continuous linear motion along +X axis (x: -48 -> +100, z = 0.0)
    const posX = -48.0 + clampedSp * 148.0;
    const position = new THREE.Vector3(posX, 0.0, 0.0);

    const tangent = new THREE.Vector3(1, 0, 0);
    const up = new THREE.Vector3(0, 1, 0);
    const matrix = new THREE.Matrix4();
    matrix.lookAt(new THREE.Vector3(0, 0, 0), tangent, up);

    const orientation = new THREE.Quaternion();
    orientation.setFromRotationMatrix(matrix);

    return {
      position,
      orientation,
      steeringAngle: 0,
    };
  }

  public getPointAt(u: number): THREE.Vector3 {
    const clampedU = THREE.MathUtils.clamp(u, 0, 1);
    return new THREE.Vector3(-48.0 + clampedU * 148.0, 0.0, 0.0);
  }
}
