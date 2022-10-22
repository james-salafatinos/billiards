//Object managed the relationship
//External Libraries
import * as THREE from "/modules/three.module.js";

class Graph {
  constructor(v, e) {
    this.vertices = v;
    this.edges = e;
    this.vertex_positions = [];
    this.edge_positions = [];
    this.vertex_velocities = [];
    this.vertex_accelerations = [];

    this.vertex_colors = [];

    this.gravity = 0.0001;
    this.k = 1;
    this.vertex_mass = [];
    this.vertex_attraction_forces = [];

    this.vertex_repulsion_forces = [];

    this.vertex_degrees;

    this.graph_particles;
    this.line;

    this.BufferVec1 = new THREE.Vector3();
    this.BufferVec2 = new THREE.Vector3();
    this.BufferVec3 = new THREE.Vector3();

    this.AdjacencyMatrix;
  }

  //Returns the number of vertices in the graph
  _V() {
    return this.vertices.length;
  }

  //Returns the number of edges in the graph
  _E() {
    return this.edges.length;
  }

  //Returns the adjacency matrix of the graph
  _AdjacencyMatrix() {
    // console.log("kicked off adj matrix()", this._V(), this._E());
    const adjMatrix = [];
    for (let i = 0; i < this._V(); i++) {
      adjMatrix[i] = [];
      for (let j = 0; j < this._V(); j++) {
        adjMatrix[i][j] = 0;
      }
    }
    for (let i = 0; i < this._E(); i++) {
      const edge = this.edges[i];
      adjMatrix[edge[0]][edge[1]] = 1;
      adjMatrix[edge[1]][edge[0]] = 1;
    }
    // console.log("finished off adj matrix()", adjMatrix);
    return adjMatrix;
  }

  //Returns the adjacency matrix of the graph
  _SetAdjacencyMatrix() {
    this.AdjacencyMatrix = this._AdjacencyMatrix();
  }

  //Returns the degree of a vertex
  _Degree(v) {
    let degree = 0;
    for (let i = 0; i < this._V(); i++) {
      degree += this._AdjacencyMatrix()[v][i];
    }
    return degree;
  }

  //Returns the degree of a vertex
  _SetDegreeBuffer() {
    if (this.AdjacencyMatrix == undefined) {
      this._SetAdjacencyMatrix();
    }
    let degrees = [];
    for (let i = 0; i < this._V(); i++) {
      for (let j = 0; i < this._V(); j++) {
        degrees[i] += this.AdjacencyMatrix[i][j];
      }
    }
    this.vertex_degrees = degrees;
    return this.vertex_degrees;
  }

  //Returns a random graph with n vertices and m edges
  _R(n, m) {
    let vertices = [];
    let edges = [];
    for (let i = 0; i < n; i++) {
      vertices.push(i);
    }
    for (let i = 0; i < m; i++) {
      let v1 = Math.floor(Math.random() * n);
      let v2 = Math.floor(Math.random() * n);

      while (v1 == v2) {
        v2 = Math.floor(Math.random() * n);
      }
      edges.push([v1, v2]);
    }
    return new Graph(vertices, edges);
  }

  //Creates a complete graph with n vertices
  _K(n) {
    let vertices = [];
    for (let i = 0; i < n; i++) {
      vertices.push(i);
    }
    let edges = [];
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        edges.push([i, j]);
      }
    }

    return new Graph(vertices, edges);
  }

  //Creates a null graph with n vertices
  _N(n) {
    let vertices = [];
    for (let i = 0; i < n; i++) {
      vertices.push(i);
    }
    let edges = [];
    return new Graph(vertices, edges);
  }

  //Creates a complete bipartite graph with n vertices
  _B(n) {
    let vertices = [];
    for (let i = 0; i < n; i++) {
      vertices.push(i);
    }
    let edges = [];
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        edges.push([i, j]);
      }
    }
    for (let i = 0; i < n; i++) {
      for (let j = n; j < 2 * n; j++) {
        edges.push([i, j]);
      }
    }
    return new Graph(vertices, edges);
  }

  //Creates a cycle graph with n vertices
  _C(n) {
    let vertices = [];
    for (let i = 0; i < n; i++) {
      vertices.push(i);
    }

    let edges = [];
    for (let i = 0; i < n; i++) {
      edges.push([i, (i + 1) % n]);
    }
    return new Graph(vertices, edges);
  }

  _drawVertices(floatSpread) {
    //Random Vertices
    for (let i = 0; i < this._V(); i++) {
      this.vertex_positions.push(
        THREE.MathUtils.randFloatSpread(floatSpread),
        THREE.MathUtils.randFloatSpread(floatSpread),
        THREE.MathUtils.randFloatSpread(floatSpread)
      );
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(this.vertex_positions, 3)
    );
    let material = new THREE.PointsMaterial({
      size: 0.1,

      sizeAttenuation: true,
      alphaTest: 0.2,
      transparent: true,
    });
    material.color.setHSL(0.6, 0.8, 0.9);
    this.graph_particles = new THREE.Points(geometry, material);
    this.scene.add(this.graph_particles);
  }
  _drawEdges() {
    //Iterates through edges {v1, v2}
    for (let i = 0; i < this._E(); i++) {
      let vidx1 = this.edges[i][0];
      let vidx2 = this.edges[i][1];

      this.edge_positions.push(
        this.vertex_positions[vidx1 * 3],
        this.vertex_positions[vidx1 * 3 + 1],
        this.vertex_positions[vidx1 * 3 + 2],
        this.vertex_positions[vidx2 * 3],
        this.vertex_positions[vidx2 * 3 + 1],
        this.vertex_positions[vidx2 * 3 + 2]
      );
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(this.edge_positions, 3)
    );
    geometry.computeBoundingSphere();
    let material = new THREE.LineBasicMaterial({
      linewidth: 1,
    });
    this.line = new THREE.LineSegments(geometry, material);
    this.scene.add(this.line);
  }

  __constrain(num, min, max) {
    return Math.min(Math.max(num, min), max);
  }

  _calculateAttractionForces() {
    if (this.vertex_mass.length < 1) {
      this.vertex_mass = Array(this._V()).fill(
        Math.floor(Math.abs(Math.random() * 5))
      );
    }
    if (this.vertex_attraction_forces.length < 1) {
      this.vertex_attraction_forces = Array(this._V() * 3).fill(0);
    }
    if (this.vertex_velocities.length < 1) {
      this.vertex_velocities = Array(this._V() * 3).fill(0);
    }
    if (this.vertex_accelerations.length < 1) {
      this.vertex_accelerations = Array(this._V() * 3).fill(0);
    }

    for (let i = 0; i < this._V(); i++) {
      for (let j = 0; j < this._V(); j++) {
        if (i != j) {
          this.BufferVec1.x = this.vertex_positions[i * 3];
          this.BufferVec1.y = this.vertex_positions[i * 3 + 1];
          this.BufferVec1.z = this.vertex_positions[i * 3 + 2];
          this.BufferVec2.x = this.vertex_positions[j * 3];
          this.BufferVec2.y = this.vertex_positions[j * 3 + 1];
          this.BufferVec2.z = this.vertex_positions[j * 3 + 2];
          this.BufferVec3 = this.BufferVec1.sub(this.BufferVec2).normalize();
          let distance = this.BufferVec1.distanceTo(this.BufferVec2);
          distance = this.__constrain(distance, 1, 2);
          let strength =
            (this.gravity * (this.vertex_mass[i] * this.vertex_mass[j])) /
            (distance * distance);
          // console.log("str", strength);
          let force = this.BufferVec3.multiplyScalar(strength);
          force.multiplyScalar(-1);
          // console.log(force);

          this.vertex_attraction_forces[i * 3] += force.x;
          this.vertex_attraction_forces[i * 3 + 1] += force.y;
          this.vertex_attraction_forces[i * 3 + 2] += force.z;
        }
      }
    }
  }
  _calculateStochasticAttractionForces(sample_size) {
    if (sample_size == undefined) {
      sample_size = this._V();
    }
    if (sample_size > this._V()) {
      throw new Error(
        "@Function Call\n ::_calculateStochasticAttractionForces(sample_size)\n ::Sample size cannot be greater than number of vertices"
      );
    }
    if (this.vertex_mass.length < 1) {
      this.vertex_mass = Array(this._V()).fill(
        Math.floor(Math.abs(Math.random() * 5))
      );
    }
    if (this.vertex_attraction_forces.length < 1) {
      this.vertex_attraction_forces = Array(this._V() * 3).fill(0);
    }
    if (this.vertex_velocities.length < 1) {
      this.vertex_velocities = Array(this._V() * 3).fill(0);
    }
    if (this.vertex_accelerations.length < 1) {
      this.vertex_accelerations = Array(this._V() * 3).fill(0);
    }

    for (let i = 0; i < this._V(); i++) {
      let stochastic_j_set = Array(sample_size).fill(
        Math.floor(Math.random() * this._V())
      );
      for (let j = 0; j < stochastic_j_set.length; j++) {
        if (i != j) {
          this.BufferVec1.x = this.vertex_positions[i * 3];
          this.BufferVec1.y = this.vertex_positions[i * 3 + 1];
          this.BufferVec1.z = this.vertex_positions[i * 3 + 2];
          this.BufferVec2.x = this.vertex_positions[j * 3];
          this.BufferVec2.y = this.vertex_positions[j * 3 + 1];
          this.BufferVec2.z = this.vertex_positions[j * 3 + 2];
          this.BufferVec3 = this.BufferVec1.sub(this.BufferVec2).normalize();
          let distance = this.BufferVec1.distanceTo(this.BufferVec2);
          distance = this.__constrain(distance, 0, 2);
          let strength =
            (this.gravity * (this.vertex_mass[i] * this.vertex_mass[j])) /
            (distance * distance);
          // console.log("str", strength);
          let force = this.BufferVec3.multiplyScalar(strength);
          force.multiplyScalar(-1);
          // console.log(force);

          this.vertex_attraction_forces[i * 3] += force.x;
          this.vertex_attraction_forces[i * 3 + 1] += force.y;
          this.vertex_attraction_forces[i * 3 + 2] += force.z;
        }
      }
    }
  }

  _calculateStochasticRepulsionForces(sample_size) {
    // if (this.vertex_degrees == undefined) {
    //   console.log("stoc");
    //   this._SetDegreeBuffer();
    // }
    if (sample_size == undefined) {
      sample_size = this._V();
    }
    if (sample_size > this._V()) {
      throw new Error(
        "@Function Call\n ::_calculateStochasticRepulsionForces(sample_size)\n ::Sample size cannot be greater than number of vertices"
      );
    }
    if (this.vertex_mass.length < 1) {
      this.vertex_mass = Array(this._V()).fill(
        Math.floor(Math.abs(Math.random() * 5))
      );
    }
    if (this.vertex_repulsion_forces.length < 1) {
      this.vertex_repulsion_forces = Array(this._V() * 3).fill(0);
    }
    if (this.vertex_velocities.length < 1) {
      this.vertex_velocities = Array(this._V() * 3).fill(0);
    }
    if (this.vertex_accelerations.length < 1) {
      this.vertex_accelerations = Array(this._V() * 3).fill(0);
    }

    for (let i = 0; i < this._V(); i++) {
      //Choose a sample size of Js
      let stochastic_j_set = Array(sample_size).fill(
        Math.floor(Math.random() * this._V())
      );
      for (let j = 0; j < stochastic_j_set.length; j++) {
        if (i != j) {
          this.BufferVec1.x = this.vertex_positions[i * 3];
          this.BufferVec1.y = this.vertex_positions[i * 3 + 1];
          this.BufferVec1.z = this.vertex_positions[i * 3 + 2];
          this.BufferVec2.x = this.vertex_positions[j * 3];
          this.BufferVec2.y = this.vertex_positions[j * 3 + 1];
          this.BufferVec2.z = this.vertex_positions[j * 3 + 2];
          this.BufferVec3 = this.BufferVec1.sub(this.BufferVec2).normalize();
          let distance = this.BufferVec1.distanceTo(this.BufferVec2);

          let strength =
            ((this.vertex_degrees[i] + 1) * (this.vertex_degrees[j] + 1)) /
            distance;

          // distance = this.__constrain(distance, 0.01, 0.1);

          let force = this.BufferVec3.multiplyScalar(strength);
          force.multiplyScalar(1);
          // console.log(force);

          this.vertex_attraction_forces[i * 3] += force.x;
          this.vertex_attraction_forces[i * 3 + 1] += force.y;
          this.vertex_attraction_forces[i * 3 + 2] += force.z;
        }
      }
    }
  }

  _applyDrag() {
    let drag_coeff = 0.4;
    for (let i = 0; i < this._V(); i++) {
      //Decay velocity by a fraction of the current velocity (e.g.,  .4)
      this.vertex_velocities[i * 3] *= drag_coeff;
      this.vertex_velocities[i * 3 + 1] *= drag_coeff;
      this.vertex_velocities[i * 3 + 2] *= drag_coeff;
    }
  }

  _applyForce(forces) {
    for (let i = 0; i < this._V(); i++) {
      this.vertex_accelerations[i * 3] += forces[i * 3];
      this.vertex_accelerations[i * 3 + 1] += forces[i * 3 + 1];
      this.vertex_accelerations[i * 3 + 2] += forces[i * 3 + 2];
    }
  }

  _applyColor(forces) {
    for (let i = 0; i < this._V(); i++) {
      this.vertex_colors[i * 3] += forces[i * 3];
      this.vertex_colors[i * 3 + 1] += forces[i * 3 + 1];
      this.vertex_colors[i * 3 + 2] += forces[i * 3 + 2];
    }
  }

  _updatePhysics() {
    //Euler Integration

    //Accelerations --> Velocities
    for (let i = 0; i < this._V(); i++) {
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

  drawRandom(params) {
    if (params === undefined) {
      params = {
        floatSpread: 200,
      };
    }

    this._drawVertices(params.floatSpread);

    this._drawEdges();
  }

  _updateMeshes() {
    //Update Nodes
    this.graph_particles.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(this.vertex_positions, 3)
    );
    this.graph_particles.geometry.attributes.position.needsUpdate = true;

    //Update Edges
    let edge_pos_prime = [];
    for (let i = 0; i < this._E(); i++) {
      let vidx1 = this.edges[i][0];
      let vidx2 = this.edges[i][1];

      edge_pos_prime.push(
        this.vertex_positions[vidx1 * 3],
        this.vertex_positions[vidx1 * 3 + 1],
        this.vertex_positions[vidx1 * 3 + 2],
        this.vertex_positions[vidx2 * 3],
        this.vertex_positions[vidx2 * 3 + 1],
        this.vertex_positions[vidx2 * 3 + 2]
      );
    }

    this.edge_positions = edge_pos_prime;

    this.line.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(this.edge_positions, 3)
    );
    this.line.geometry.attributes.position.needsUpdate = true;
  }
  // color(hex) {
  //   if (hex === undefined) {
  //     hex = 0xffffff;
  //   }
  //   // thisaaaa;
  // }
  update() {
    this._calculateAttractionForces();
    // this._calculateStochasticAttractionForces(3);

    this._applyForce(this.vertex_attraction_forces); //G

    // this._calculateStochasticRepulsionForces(3);
    // this._applyForce(this.vertex_repulsion_forces);

    this._applyDrag();
    this._updatePhysics();

    this._updateMeshes();
  }
}

export { Graph };
