import { Edge, Vertex } from '../models/graph-model';
import { escapeSingleQuote } from '../utils/safeString';

export function getAddVertexQuery(vertexObj: Vertex): string {
  const label = escapeSingleQuote(vertexObj.label);
  const query = `g.addV('${label}')`;
  return query + getPropertiesQuery(vertexObj);
}

export function getUpdateVertexQuery(vertexObj: Vertex): string {
  const id = escapeSingleQuote(vertexObj.properties.id);
  const query = `g.V().hasId('${id}')`;
  return query + getPropertiesQuery(vertexObj);
}

export function getUpdateEdgeQuery(edgeObj: Edge): string {
  const id = escapeSingleQuote(edgeObj.properties.id);
  const query = `g.E().hasId('${id}')`;
  return query + getPropertiesQuery(edgeObj);
}

export function getAddEdgeQuery(edgeObj: Edge): string {
  const from = escapeSingleQuote(edgeObj.from);
  const to = escapeSingleQuote(edgeObj.to);
  const label = escapeSingleQuote(edgeObj.label);
  const query =
    `g.V().has('id','${from}').addE('${label}')` +
    `.to(g.V().has('id','${to}'))`;

  return query + getPropertiesQuery(edgeObj);
}

export function getPropertiesQuery(obj: Vertex | Edge): string {
  let query = '';
  if (obj.properties) {
    for (const key of Object.keys(obj.properties)) {
      let value = obj.properties[key];
      if (typeof value === 'string') {
        value = escapeSingleQuote(value);
        value = `'${value}'`;
      }
      const safeKey = escapeSingleQuote(key);
      query += `.property('${safeKey}',${value})`;
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
    let edgeId = `${edge.label}-${edge.from}-${edge.to}`;
    if (edge.properties && edge.properties.id) {
      edgeId = edge.properties.id;
    }
    return seen.hasOwnProperty(edgeId) ? false : (seen[edgeId] = true);
  });
}
