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

    if (clampedSp < 0.70) {
      // 1. Truck Approach & Cave Transit (x = -48 -> 70, z = 0)
      posX = -48.0 + (clampedSp / 0.70) * 118.0;
      posZ = 0.0;
      tangent.set(1, 0, 0);
    } else if (clampedSp < 0.80) {
      // 2. Horizontal Straight Road in Top-Down View (x = 70 -> 140, z = 0)
      const t = (clampedSp - 0.70) / 0.10;
      posX = 70.0 + t * 70.0;
      posZ = 0.0;
      tangent.set(1, 0, 0);
    } else if (clampedSp < 0.88) {
      // 3. Smooth 90-Degree Road Turn (Radius R = 45, Center at x=140, z=45)
      const t = (clampedSp - 0.80) / 0.08;
      const angle = (t * Math.PI) / 2; // 0 to 90 deg
      const radius = 45.0;
      
      posX = 140.0 + radius * Math.sin(angle);
      posZ = radius * (1.0 - Math.cos(angle));
      
      tangent.set(Math.cos(angle), 0, Math.sin(angle)).normalize();
    } else {
      // 4. Extended Long Vertical Road Travel down the screen (x = 185, z = 45 -> 325)
      const t = (clampedSp - 0.88) / 0.12;
      posX = 185.0;
      posZ = 45.0 + t * 280.0;
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
