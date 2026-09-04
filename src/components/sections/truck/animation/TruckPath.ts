import * as THREE from "three";

export interface PathTransform {
  position: THREE.Vector3;
  orientation: THREE.Quaternion;
  tangent: THREE.Vector3;
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
    
    let posX = 0;
    let posZ = 0;
    const tangent = new THREE.Vector3(1, 0, 0);

    if (clampedSp < 0.14) {
      // Phase 01: Screen Locked Establishing View Dwell (truck locked at x = -48.0)
      posX = -48.0;
      posZ = 0.0;
      tangent.set(1, 0, 0);
    } else if (clampedSp < 0.58) {
      // 1. Truck Approach & Cave Transit (x = -48 -> 70, z = 0)
      const t = (clampedSp - 0.14) / (0.58 - 0.14);
      posX = -48.0 + t * 118.0;
      posZ = 0.0;
      tangent.set(1, 0, 0);
    } else if (clampedSp < 0.78) {
      // 2. Horizontal Straight Road in Side-Profile View (x = 70 -> 140, z = 0)
      const t = (clampedSp - 0.58) / (0.78 - 0.58);
      posX = 70.0 + t * 70.0;
      posZ = 0.0;
      tangent.set(1, 0, 0);
    } else if (clampedSp < 0.84) {
      // 3. Smooth 90-Degree Road Turn (Radius R = 45, Center at x=140, z=45)
      const t = (clampedSp - 0.78) / 0.06;
      const angle = (t * Math.PI) / 2; // 0 to 90 deg
      const radius = 45.0;
      
      posX = 140.0 + radius * Math.sin(angle);
      posZ = radius * (1.0 - Math.cos(angle));
      
      tangent.set(Math.cos(angle), 0, Math.sin(angle)).normalize();
    } else {
      // 4. Long Vertical Highway Journey Across 3 Milestones (x = 185, z = 45 -> 520)
      const t = (clampedSp - 0.84) / 0.16;
      posX = 185.0;
      posZ = 45.0 + t * 475.0;
      tangent.set(0, 0, 1);
    }

    const position = new THREE.Vector3(posX, 0.0, posZ);

    const up = new THREE.Vector3(0, 1, 0);
    const matrix = new THREE.Matrix4();
    matrix.lookAt(new THREE.Vector3(0, 0, 0), tangent, up);

    const orientation = new THREE.Quaternion();
    orientation.setFromRotationMatrix(matrix);

    return {
      position,
      orientation,
      tangent,
      steeringAngle: 0,
    };
  }

  public getPointAt(u: number): THREE.Vector3 {
    return this.getTransform(u).position;
  }
}
