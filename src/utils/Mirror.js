import * as THREE from "/modules/three.module.js";
class Mirror {
  constructor(scene) {
    this.scene = scene;
    this.mirrors = [];
  }

  create(x = 0, y = 9, z = 0, rotationx = 0, rotationy = 0, rotationz = 0) {
    let mat = new THREE.MeshPhongMaterial({
      wireframe: false,
      transparent: false,
      depthTest: false,
      side: THREE.DoubleSide,
      opacity: 1,
      color: new THREE.Color(0.5, 0.5, 0.5),
    });
    let geo = new THREE.BoxGeometry(25, 25, 0.2);
    console.log(geo.attributes.normal);
    let mesh = new THREE.Mesh(geo, mat);
    mesh.position.x = x;
    mesh.position.y = y;
    mesh.position.z = z;
    mesh.rotation.x = rotationx;
    mesh.rotation.y = rotationy;
    mesh.rotation.z = rotationz;
    mesh.castShadow = true;

    this.scene.add(mesh);
    this.mirrors.push(mesh.clone());
    return mesh;
  }
  createSphere(
    x = 0,
    y = 9,
    z = 0,
    rotationx = 0,
    rotationy = 0,
    rotationz = 0
  ) {
    let mat = new THREE.MeshPhongMaterial({
      wireframe: false,
      transparent: false,
      depthTest: false,
      side: THREE.DoubleSide,
      opacity: 1,
      color: new THREE.Color(0.5, 0.5, 0.5),
    });
    let geo = new THREE.SphereGeometry(50, 5);
    console.log(geo.attributes.normal);
    let mesh = new THREE.Mesh(geo, mat);
    mesh.position.x = x;
    mesh.position.y = y;
    mesh.position.z = z;
    mesh.rotation.x = rotationx;
    mesh.rotation.y = rotationy;
    mesh.rotation.z = rotationz;
    mesh.castShadow = true;

    this.scene.add(mesh);
    this.mirrors.push(mesh.clone());
    return mesh;
  }
}

export { Mirror };
