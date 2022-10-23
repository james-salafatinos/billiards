import * as THREE from "/modules/three.module.js";

class RadialSource {
  constructor(
    scene,
    num_particles,
    initial_position,
    initial_velocity,
    worldOctree
  ) {
    this.scene = scene;
    this.NUM_PARTICLES = num_particles;
    this.INITIAL_VELOCITY = initial_velocity;
    this.INITIAL_POSITION = initial_position;
    this.vertex_positions = [];
    this.last_vertex_positions = [];
    this.vertex_velocities = [];
    this.vertex_accelerations = [];
    this.vertex_values = [];
    this.vertex_mesh = null;

    this.BufferVec1 = new THREE.Vector3();
    this.BufferVec2 = new THREE.Vector3();
    this.BufferVec3 = new THREE.Vector3();

    this.worldOctree = worldOctree;
    console.log(this.worldOctree);

    //Protos
    THREE.Vector3.prototype.randomUnitVector = function () {
      this.x = Math.random() * 2 - 1;
      this.y = Math.random() * 2 - 1;
      this.z = Math.random() * 2 - 1;
      this.normalize();
      return this;
    };
  }

  //A function that initializes particles in a circle
  initVertices() {
    for (let i = 0; i < this.NUM_PARTICLES; i++) {
      this.vertex_positions.push(
        this.INITIAL_POSITION.x,
        this.INITIAL_POSITION.y,
        this.INITIAL_POSITION.z
      );
      this.last_vertex_positions.push(
        this.INITIAL_POSITION.x,
        this.INITIAL_POSITION.y,
        this.INITIAL_POSITION.z
      );
      this.vertex_accelerations.push(0, 0, 0);
      this.vertex_values.push(0, 0, 0);
    }
    console.log(this.vertex_positions);
  }
  //A function that initializes particles in a circle
  initVelocities() {
    let V = new THREE.Vector3();
    for (let i = 0; i < this.NUM_PARTICLES; i++) {
      let v = V.randomUnitVector().multiplyScalar(this.INITIAL_VELOCITY);
      this.vertex_velocities.push(v.x, v.y, v.z);
    }
    // console.log(this.vertex_velocities);
  }

  drawParticles() {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(this.vertex_positions, 3)
    );
    let material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      sizeAttenuation: true,
      alphaTest: 0.2,
      transparent: true,
    });
    // material.color.setHSL(0.6, 0.8, 0.9);
    this.vertex_mesh = new THREE.Points(geometry, material);
    this.scene.add(this.vertex_mesh);
  }

  _checkCollisions() {
    let center_buffer = new THREE.Vector3();
    let collider = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 0.5);

    for (let i = 0; i < this.NUM_PARTICLES; i++) {
      center_buffer.x = this.vertex_positions[i * 3];
      center_buffer.y = this.vertex_positions[i * 3 + 1];
      center_buffer.z = this.vertex_positions[i * 3 + 2];
      collider.center = center_buffer;

      const result = this.worldOctree.sphereIntersect(collider);

      if (result) {
        let normal = result.normal.multiplyScalar(this.INITIAL_VELOCITY);
        this.vertex_velocities[i * 3] = normal.x;
        this.vertex_velocities[i * 3 + 1] = normal.y;
        this.vertex_velocities[i * 3 + 2] = normal.z;

        // this.vertex_values[i * 3] += 0.025;
        // this.vertex_values[i * 3 + 1] += 0.05;
        // this.vertex_values[i * 3 + 2] += 0.1;
      }
    }
  }
  _updatePhysics() {
    //Euler Integration
    //Accelerations --> Velocities
    for (let i = 0; i < this.NUM_PARTICLES; i++) {
      //Store positions
      //Velocities --> Positions
      this.last_vertex_positions[i * 3] = this.vertex_positions[i * 3];
      this.last_vertex_positions[i * 3 + 1] = this.vertex_positions[i * 3 + 1];
      this.last_vertex_positions[i * 3 + 2] = this.vertex_positions[i * 3 + 2];

      //Update velocities
      this.vertex_velocities[i * 3] += this.vertex_accelerations[i * 3];
      this.vertex_velocities[i * 3 + 1] += this.vertex_accelerations[i * 3 + 1];
      this.vertex_velocities[i * 3 + 2] += this.vertex_accelerations[i * 3 + 2];

      //Velocities --> Positions
      this.vertex_positions[i * 3] += this.vertex_velocities[i * 3];
      this.vertex_positions[i * 3 + 1] += this.vertex_velocities[i * 3 + 1];
      this.vertex_positions[i * 3 + 2] += this.vertex_velocities[i * 3 + 2];

      //Set accelerations to 0
      this.vertex_accelerations[i * 3] = 0;
      this.vertex_accelerations[i * 3 + 1] = 0;
      this.vertex_accelerations[i * 3 + 2] = 0;
    }
  }
  _updateMeshes() {
    //Update vertices
    this.vertex_mesh.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(this.vertex_positions, 3)
    );
    // this.vertex_mesh.geometry.setAttribute(
    //   "color",
    //   new THREE.Float32BufferAttribute(this.vertex_values, 3)
    // );

    this.vertex_mesh.geometry.attributes.position.needsUpdate = true;
  }

  tstep() {
    this._checkCollisions();
    this._updatePhysics();
    this._updateMeshes();
  }
}
export { RadialSource };
