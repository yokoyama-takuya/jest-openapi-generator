import { Request } from './type';
import FileUtil from "./file_util";
import { generator } from "./generator";

describe('generator', () => {

  it('empty', () => {
    const request: Request = { method: 'GET', path: '/empty' };
    const response = { statusCode: 200 };
    generator(request, response);
    const path = FileUtil.readTemporary(request);
    const result = {"/empty":{"get":{"parameters":[],"responses":{}}}}
    expect(path).toStrictEqual(result);
  })

  it('only_response', () => {
    const request: Request = { method: 'GET', path: '/only_response' };
    const response = { statusCode: 200, json: { test: 'test' } };
    generator(request, response);
    const path = FileUtil.readTemporary(request);
    const result = {
      "/only_response": {
        "get": {
          "parameters": [],
          "responses": {
            "200": {
              "content": {
                "application/json": {
                  "example": {
                    "test": "test"
                  }
                }
              }
            },
          }
        }
      }
    }
    expect(path).toStrictEqual(result);
  })

  it('get_parameters', () => {
    const request: Request = { method: 'GET', path: '/get_parameters/{id}', query: { id: 123, filter: 'active' } }
    const response = { statusCode: 200, json: { test: 'test' } }
    generator(request, response);
    const path = FileUtil.readTemporary(request);
    const result =  {
      "/get_parameters/{id}": {
        "get": {
          "parameters": [{
            "in": "path",
            "name": "id",
            "schema": {
              "example": 123,
              "type": "number",
            }
          }, {
            "in": "query",
            "name": "filter",
            "schema": {
              "example": 'active',
              "type": "string",
            }
          }],
          "responses": {
            "200": {
              "content": {
                "application/json": {
                  "example": {
                    "test": "test"
                  }
                }
              }
            }
          }
        }
      }
    }
    expect(path).toStrictEqual(result);
  });

  it('post_parameters', () => {
    const request: Request = { method: 'POST', path: '/post_parameters/{id}', query: { id: 'id' }, body: { test: 'body', filter: 1.23 } }
    const response = { statusCode: 200, json: { test: 'test' } }
    generator(request, response);
    const paths = FileUtil.readTemporary(request);
    const result =  {
      "/post_parameters/{id}": {
        "post": {
          "parameters": [{
            "in": "path",
            "name": "id",
            "schema": {
              "example": 'id',
              "type": "string"
            }
          }, {
            "in": "body",
            "schema": {
              "type": "object",
              "properties": {
                "test": {
                  "type": "string"
                },
                "filter": {
                  "type": "number",
                }
              },
              "example": {
                "test": "body",
                "filter": 1.23,
              }
            }
          }],
          "responses": {
            "200": {
              "content": {
                "application/json": {
                  "example": {
                    "test": "test"
                  }
                }
              }
            }
          }
        }
      }
    }
    expect(paths).toStrictEqual(result);
  })

  it('multiple_response', () => {
    const request: Request = { method: 'GET', path: '/multiple_response' }
    const response200 = { statusCode: 200, json: { test: 'test' } }
    const response400 = { statusCode: 400, json: { test: 'error' } }
    generator(request, response200);
    generator(request, response400);
    const path = FileUtil.readTemporary(request);
    const result = {
      "/multiple_response": {
        "get": {
          "parameters": [],
          "responses": {
            "200": {
              "content": {
                "application/json": {
                  "example": {
                    "test": "test"
                  }
                }
              }
            },
            "400": {
              "content": {
                "application/json": {
                  "example": {
                    "test": "error"
                  }
                }
              }              
            }
          }
        }
      }
    }
    expect(path).toStrictEqual(result);
  });

  it('include_info', () => {
    const info = {
      summary: 'summary',
      operationId: 'postIncludeInfo',
      tags: ['Test'],
      query: {
        id: {
          required: true,
          schema: {
            type: 'integer'
          }
        },
        filter: {
          schema: {
            type: 'string',
            enum: ['active', 'finished'],
          }
        },
      },
      body: {
        schema: {
          type: 'object',
          properties: {
            testId: {
              type: "string",
              format: 'uuid'
            },
            point: {
              type: "number",
              format: 'float'
            },
          }
        }
      },
      response: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                tests: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Test' },
                },
              },
            },
          },
        },
      },
    }

    const request: Request = { method: 'POST', path: '/include_info', query: { id: 1, filter: 'finished' }, body: {testId: 'uuid', point: 1.23} }
    const response = { statusCode: 200, json: { tests: [{ 'test': 'test' }] } }
    generator(request, response, info);
    const path = FileUtil.readTemporary(request);
    const result = {
      "/include_info": {
        "post": {
          "summary": "summary",
          "operationId": "postIncludeInfo",
          "tags": ["Test"],
          "parameters": [{
            "in": "query",
            "name": "id",
            "required": true,
            "schema": {
              "type": "integer",
              "example": 1
            }
          }, {
            "in": "query",
            "name": "filter",
            "schema": {
              "type": "string",
              "enum": ["active", "finished"],
              "example": "finished"
            }
          }, {
            "in": "body",
            "schema": {
              "type": "object",
              "properties": {
                "testId": {
                  "type": "string",
                  "format": "uuid",
                },
                "point": {
                  "type": "number",
                  'format': "float",
                }
              },
              "example": {
                "testId": "uuid",
                "point": 1.23
              }
            }
          }],
          "responses": {
            "200": {
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "tests": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/Test"
                        }
                      }
                    }
                  },
                  "example": {
                    "tests": [{
                      "test": "test"
                    }]
                  }
                }
              }
            }
          }
        }
      }
    }
    expect(path).toStrictEqual(result);
  })

});