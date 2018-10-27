export interface Vertex {
  label: string;
  properties: {
    id: string;
    [key: string]: any;
  };
}

export interface Edge {
  label: string;
  to: string;
  from: string;
  properties?: {
    id?: string;
    [key: string]: any;
  };
}

export interface GraphInfo {
  vertices: Vertex[];
  edges: Edge[];
}

export interface VertexEdgeArray {
  [index: number]: Vertex | Edge;
}

// tslint:disable-next-line:interface-name
export interface GraphCmd {
  vertexCmd: string[];
  edgeCmd: string[];
}

export enum etype {
  vertex = 'vertex',
  edge = 'edge',
}
