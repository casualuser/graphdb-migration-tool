import * as async from 'async';
import * as convertHrtime from 'convert-hrtime';
import * as Gremlin from 'gremlin';
import { stdout as log } from 'single-line-log';
import * as GraphHelper from '../helpers/graphHelper';
import { Edge, GraphInfo, Vertex, etype } from '../models/graph-model';
import { isNullOrUndefined } from 'util';

export class GremlinConnector {
  private client: Gremlin.GremlinClient;
  private batchSize: number;
  private upsert: boolean;
  private defaultBatchSize = 10;

  constructor(config: any) {
    this.client = Gremlin.createClient(config.port, config.host, {
      password: config.password,
      session: false,
      ssl: true,
      user: config.user,
    });
    this.batchSize = config.batchSize
      ? config.batchSize
      : this.defaultBatchSize;
    this.upsert = config.upsert;
  }

  public createGraph(graphInfo: GraphInfo, callback: any) {
    async.series(
      [
        (cb: any) => {
          this.addVertices(graphInfo.vertices, cb);
        },
        (cb: any) => {
          this.addEdges(graphInfo.edges, cb);
        },
      ],
      err => callback(err)
    );
  }

  public addVertices(vertices: Vertex[], callback: any) {
    const timer = process.hrtime();
    async.eachOfLimit(
      vertices,
      this.batchSize,
      (value, key, cb) => {
        this.checkExists(
          etype.vertex,
          value.properties.id,
          (err: any, res: boolean) => {
            if (err) cb(err);
            const command = res
              ? GraphHelper.getUpdateVertexQuery(value)
              : GraphHelper.getAddVertexQuery(value);
            this.client.execute(command, (err, res) => {
              if (!err) {
                log(
                  `Added vertices: ${(key as number) + 1}/${vertices.length}`
                );
              }
              cb(err as any);
            });
          }
        );
      },
      err => {
        if (err) {
          callback(err);
        } else {
          console.log('\nFinished adding vertices');
          const timeTaken = convertHrtime(process.hrtime(timer)).seconds;
          console.log(
            `Added ${vertices.length} vertices in ${timeTaken} seconds`
          );
          callback();
        }
      }
    );
  }

  public addEdges(edges: Edge[], callback: any) {
    const timer = process.hrtime();
    async.eachOfLimit(
      edges,
      this.batchSize,
      (value, key, cb) => {
        const command = GraphHelper.getAddEdgeQuery(value);
        this.client.execute(command, (err, res) => {
          if (!err) {
            log(`Adding edges: ${(key as number) + 1}/${edges.length}`);
          }
          cb(err as any);
        });
      },
      err => {
        if (err) {
          callback(err);
        } else {
          console.log('\nFinished adding edges');
          const timeTaken = convertHrtime(process.hrtime(timer)).seconds;
          console.log(`Added ${edges.length} edges in ${timeTaken} seconds`);
          callback();
        }
      }
    );
  }

  public closeConnection() {
    this.client.closeConnection();
  }

  public checkExists(type: etype, id: string, callback: any) {
    if (!this.upsert || isNullOrUndefined(id)) {
      callback(null, false);
      return;
    }
    let query: string;
    if (type === etype.vertex) {
      query = `g.V().hasId('${id}').count()`;
    } else {
      query = `g.E().hasId('${id}').count()`;
    }
    this.client.execute(query, (err, res) => {
      var exists = false;
      if (res && res.length > 0 && res[0] > 0) exists = true;
      callback(err, exists);
    });
  }
}
