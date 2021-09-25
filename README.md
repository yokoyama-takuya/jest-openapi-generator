# jest-openapi-generator

Jest OpenAPI Generator can create OpenAPI 3.0 Specification from test code. 

- Simple test code with [Jest](https://github.com/facebook/jest).
- Can use any http request library.
- Test response to use example for OpenAPI.
- Beautiful document by [Swagger UI](https://swagger.io/tools/swagger-ui/).


## Getting Started

1. Installation

```bash
yarn add --dev jest-openapi-generator
```

or

```bash
npm install --save-dev jest-openapi-generator
```

2. Add reporters to Jest config

```.js
// jest.config.js
module.exports = {
  ...
  reporters: [
    'default',
    ['jest-openapi-generator/build/reporter', { output: 'docs/swagger.yaml' }],
    ...
  ],
}
```

- `output`: Output file path yaml or json.  default: `swagger.yaml`

3. [Optional] Add Template OpenAPI config file.

Can use components and $ref. > [see detail](https://swagger.io/docs/specification/components/)


`jest-openapi-generator.config.yaml` (or json)
```yaml
openapi: 3.0.3
info:
  version: 1.0.0
  title: API
servers:
  - url: 'http://localhost:3000/api'
components:
  schemas:
    Project:
      type: object
      required:
        - id
        - name
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
          maxLength: 50
```

4. Create spec file

Example is use by [node-mocks-http](https://github.com/howardabrams/node-mocks-http).

```ts
import httpMocks from 'node-mocks-http';
import JestGenerator, { generator } from 'jest-openapi-generator';

// [Require]
const Request: JestGenerator.Request = {
  method: 'GET',
  path: '/projects',
};

// [Optional] Embed schema info
const Info: JestGenerator.AdditionalInfo = {
  summary: 'all project',
  operationId: 'getProjects',
  tags: ['Project'],
  query: {
    take: {
      required: true,
      schema: {
        type: 'integer',
        minimum: 1,
        maximum: 30,
      },
    }
  },
  response: {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            projects: {
              type: 'array',
              items: { $ref: '#/components/schemas/Project' },
            },
          },
        },
      },
    },
  },
};

describe(`${Request.method} ${Request.path}`, () => {
  it('success', async () => {
    const params = {...Request, query: { take: 30 }};
    const req = httpMocks.createRequest(params);
    const res = httpMocks.createResponse();
    // handler is any method. e.g. res.status(200).json({ projects: [] });
    await handler(req, res);

    const json = res._getJSONData();
    const result = { 
      statusCode: res._getStatusCode(),
      json,
    };
    generator(params, result, Info);
    expect(json.projects.length).toBe(0);
  });
  
  it('error', async () => {
    const params = {...Request, query: { invalid: 'xxxxx' }};
    const req = httpMocks.createRequest(params);
    const res = httpMocks.createResponse();
    // handler is any method. e.g. res.status(405).json({ status: 405 });
    await handler(req, res);

    const json = res._getJSONData();
    const result = { 
      statusCode: res._getStatusCode(),
      json,
    };
    generator(params, result, Info);
    expect(json.status).toBe(405);
  });

  it('with out generate spec', async () => {
    // can write other spec
  });
});
```

[>> See more usage](./src/generator.test.ts)
