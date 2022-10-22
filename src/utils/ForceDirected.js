//Object managed the relationship
//External Libraries
import * as THREE from "/modules/three.module.js";
import { Graph } from "./Graph.js";

class ForceDirectedEngine extends Graph {
  constructor(v, e) {
    this.vertices = v;
    this.edges = e;
    this.vertex_positions = [];
    this.edge_positions = [];
    this.vertex_velocities = [];

    this.graph_particles;
    this.line;
  }
}
export { Graph };
