import * as THREE from "three";
import BlockMaterial from "../materials/BlockMaterial.js";
import { simplex } from "../utils/simplex-noise";

export default class TerrainGenerator {
  constructor(scene) {
    this.scene = scene;
    this.grassMaterial = new BlockMaterial("grass");
    this.dirtMaterial = new BlockMaterial("dirt");
    this.stoneMaterial = new BlockMaterial("stone");
    this.sandMaterial = new BlockMaterial("sand");

    this.treeMaterial = new BlockMaterial("tree");
    this.leafMaterial = new BlockMaterial("leaf");
    this.leafMap = new Set();
    this.noise = new simplex.SimplexNoise();
    this.terrain = [];
    this.treeCount = 0;
    this.currentTerrain = [];
  }
  build() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const grass = new THREE.InstancedMesh(geometry, this.grassMaterial, 8500);
    const sand = new THREE.InstancedMesh(geometry, this.sandMaterial, 2000);
    const tree = new THREE.InstancedMesh(geometry, this.treeMaterial, 50);
    const leaf = new THREE.InstancedMesh(geometry, this.leafMaterial, 1000);
    grass.name = 'grass';
    sand.name = 'sand';
    tree.name = 'tree';
    leaf.name = 'leaf';
    let grassCount = 0,
      treeCount = 0,
      leafCount = 0,
      sandCount = 0;
    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();

    for (let x = 0; x < 96; x++) {
      for (let y = 0; y < 1; y++) {
        for (let z = 0; z < 96; z++) {
          let noise = Math.round(this.noise.noise2D(x / 36, z / 36) * 3);
          matrix.setPosition(x, y + noise, z);
          if (noise < -1) {
            sand.setMatrixAt(sandCount, matrix);
            sand.setColorAt(sandCount++, color);
          } else {
            grass.setMatrixAt(grassCount, matrix);
            grass.setColorAt(grassCount++, color);
          }

          if (Math.random() > 0.999 && noise >= -1 && this.treeCount < 10) {
            let height = 5;
            this.treeCount += 1;
            for (let i = 0; i < height; i++) {
              matrix.setPosition(x, y + noise + 1 + i, z);
              this.leafMap.add(matrix.elements.join());
              tree.setMatrixAt(treeCount, matrix);
              tree.setColorAt(treeCount++, color);
            }
            for (let x2 = 0; x2 < 8; x2++) {
              for (let y2 = 0; y2 < 3; y2++) {
                for (let z2 = 0; z2 < 8; z2++) {
                  let noiseX = Math.round(
                    this.noise.noise3D(y2, z2, Math.random()) * 3
                  );
                  let noiseY = Math.round(
                    this.noise.noise3D(x2, z2, Math.random()) * 2
                  );
                  let noiseZ = Math.round(
                    this.noise.noise3D(x2, y2, Math.random()) * 3
                  );

                  matrix.setPosition(
                    x + noiseX,
                    y + noise + noiseY + height,
                    z + noiseZ
                  );
                  if (!this.hasLeafAt(matrix)) {
                    leaf.setMatrixAt(leafCount, matrix);
                    leaf.setColorAt(leafCount++, color);
                  }
                }
              }
            }
          }
        }
      }
    }
    console.log(grassCount,
      treeCount,
      leafCount,
      sandCount)
    this.scene.add(grass, tree, leaf, sand);
    this.terrain = [grass, tree, leaf, sand];
  }

  hasLeafAt(matrix) {
    if (this.leafMap.has(matrix.elements.join())) {
      return true;
    } else {
      this.leafMap.add(matrix.elements.join());
      return false;
    }
  }

  isFaceVisible(face) {
    return true;
  }
}
