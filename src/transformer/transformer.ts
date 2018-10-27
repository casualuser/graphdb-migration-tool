import * as Ajv from 'ajv';
import * as handlebars from 'handlebars';
import * as jsonlint from 'jsonlint';
import * as uuid from 'uuid';
import * as GraphHelper from '../helpers/graphHelper';
import { Edge, GraphInfo, Vertex } from '../models/graph-model';
import { ajvErrorLint } from '../utils/ajvErrorLint';

export class Transformer {
  private validator: Ajv.Ajv;

  constructor(config: any) {
    this.registerHelpers();
    this.validator = new Ajv({ jsonPointers: true });
  }

  public parseTemplate(template: string, data: object): string {
    const compiledTemplate = handlebars.compile(template);
    return compiledTemplate(data);
  }

  public transformJSON(
    template: string,
    jsonArray: object[],
    validationSchema?: object
  ): GraphInfo {
    let vertices: Vertex[] = [];
    let edges: Edge[] = [];

    jsonArray.forEach(doc => {
      const transformedDoc = this.parseTemplate(template, doc);
      const result: GraphInfo = jsonlint.parse(transformedDoc);
      if (validationSchema) {
        this.validateJSON(result, validationSchema);
      }

      vertices = vertices.concat(result.vertices);
      edges = edges.concat(result.edges);
    });

    vertices = GraphHelper.removeDuplicateVertexes(vertices);
    edges = GraphHelper.removeDuplicateEdges(edges);
    return { vertices, edges };
  }

  public validateJSON(json: any, schema: object) {
    const valid = this.validator.validate(schema, json);
    if (!valid) {
      const output = ajvErrorLint(
        json,
        this.validator.errors![0] as Ajv.ErrorObject,
        this.validator.errorsText()
      );
      throw new Error('Schema validation error: \n' + output);
    }
    return valid;
  }

  private registerHelpers(): void {
    handlebars.registerHelper('$guid', () => uuid.v4());
  }
}
