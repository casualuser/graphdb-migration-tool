import { Transformer } from '../../src/transformer/transformer';
import graphSchema from '../../src/schema/graph-schema';

var template = `{
    "vertices":[
      {
        "label": "vertexLabel",
        "properties":{
          "id": "{{myId}}",
          "name": "{{myName}}"
        }
      },
      {
        "label": "vertexLabel",
        "properties":{
          "id": "{{myFriendId}}",
          "name": "{{myFriendName}}"
        }
      }
    ],
    "edges":[
      {
        "label": "friend",
        "from": "{{myId}}",
        "to": "{{myFriendId}}",
        "properties": {
          "value" : {{friendshipLvl}}
        }
      }
    ]
  }`;

describe('Given transformer is initialised', () => {
  let transformer: Transformer;
  beforeAll(() => {
    transformer = new Transformer({});
  });

  it('when parseTemplate is called it should return the parsed data', () => {
    var result = transformer.parseTemplate(`{{hello}}`, { hello: 'world' });
    expect(result).toEqual('world');
  });

  it('when parseTemplate is called it with guid helper it should return the parsed data', () => {
    var guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    var result = transformer.parseTemplate(`{{$guid}}`, {});
    expect(result).toMatch(guidRegex);
  });

  it('when transformJSON is called it should transform JSON', () => {
    var data = [
      {
        myId: '1',
        myName: 'abc',
        myFriendId: '2',
        myFriendName: 'xyz',
        friendshipLvl: 3,
      },
    ];

    var expectedResult = {
      vertices: [
        {
          label: 'vertexLabel',
          properties: {
            id: '1',
            name: 'abc',
          },
        },
        {
          label: 'vertexLabel',
          properties: {
            id: '2',
            name: 'xyz',
          },
        },
      ],
      edges: [
        {
          label: 'friend',
          from: '1',
          to: '2',
          properties: {
            value: 3,
          },
        },
      ],
    };

    var result = transformer.transformJSON(template, data, graphSchema);

    expect(result).toEqual(expectedResult);
  });

  it('when validateJSON is called and json does not match the schema, it should throw error', () => {
    var json = { vertices: [{ test: 'data' }] };
    expect(() => transformer.validateJSON(json, graphSchema)).toThrow();
  });
});
