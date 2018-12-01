import { Edge, Vertex } from '../models/graph-model';

export function getAddVertexQuery(vertexObj: Vertex): string {
  const query = `g.addV('${vertexObj.label}')`;
  return query + getPropertiesQuery(vertexObj);
}

export function getUpdateVertexQuery(vertexObj: Vertex): string {
  const query = `g.V().hasId('${vertexObj.properties.id}')`;
  return query + getPropertiesQuery(vertexObj);
}

export function getUpdateEdgeQuery(vertexObj: Vertex): string {
  const query = `g.E().hasId('${vertexObj.properties.id}')`;
  return query + getPropertiesQuery(vertexObj);
}

export function getAddEdgeQuery(edgeObj: Edge): string {
  const query =
    `g.V().has('id','${edgeObj.from}').addE('${edgeObj.label}')` +
    `.to(g.V().has('id','${edgeObj.to}'))`;

  return query + getPropertiesQuery(edgeObj);
}

export function getPropertiesQuery(obj: Vertex | Edge): string {
  let query = '';
  if (obj.properties) {
    for (const key of Object.keys(obj.properties)) {
      let value = obj.properties[key];
      if (typeof value === 'string') {
        value = `'${value}'`;
      }
      query += `.property('${key}',${value})`;
    }
  }
  return query;
}

export function removeDuplicateVertexes(vertexes: Vertex[]) {
  const seen: { [key: string]: boolean } = {};
  return vertexes.filter(vertex => {
    return seen.hasOwnProperty(vertex.properties.id)
      ? false
      : (seen[vertex.properties.id] = true);
  });
}

export function removeDuplicateEdges(edges: Edge[]) {
  const seen: { [key: string]: boolean } = {};
  return edges.filter(edge => {
    const edgeId = `${edge.label}-${edge.from}-${edge.to}`;
    return seen.hasOwnProperty(edgeId) ? false : (seen[edgeId] = true);
  });
}
