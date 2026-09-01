import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export class AircraftAssetManager {
  private aircraftGroup: THREE.Group = new THREE.Group();
  public isLoaded: boolean = false;

  public getGroup(): THREE.Group {
    return this.aircraftGroup;
  }

  public load(
    scene: THREE.Scene,
    onSuccess?: (group: THREE.Group) => void,
    onError?: (err: Error) => void
  ) {
    const loader = new GLTFLoader();
    loader.load(
      "/assets/mining/aircraft.glb",
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(0.3, 0.3, 0.3);
        model.castShadow = true;
        this.aircraftGroup.add(model);
        this.isLoaded = true;
        onSuccess?.(this.aircraftGroup);
      },
      undefined,
      (err) => {
        console.warn("Aircraft GLB asset missing at public/assets/mining/aircraft.glb:", err);
        onError?.(err as Error);
      }
    );
  }
}
