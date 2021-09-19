import FileUtil from './file_util';
import { AdditionalInfo, Request, Response } from './type';

const valueToSwaggerType = (value: any): { type?: string } => {
  const type = typeof value;
  switch(type) {
    case 'string':
    case 'number':
    case 'object':
      return {
        type,
        // TODO: add format etc...
      }
    default: {
      return {}
    }
  }
}

export const generator = (
  request: Request,
  response: Response,
  info?: AdditionalInfo
): void => {

  const Paths = FileUtil.readTemporary(request) || {};
  if (!Paths[request.path]) {
    Paths[request.path] = {};
  }
  const method = request.method.toLowerCase();
  const {
    path: pathInfo,
    query: queryInfo,
    body: bodyInfo,
    response: responseInfo,
    ...others
  } = (JSON.parse(JSON.stringify(info || {})) as AdditionalInfo)

  if (!Paths[request.path][method]) {
    Paths[request.path][method] = { parameters: [], responses: {} };
  }

  if (others) {
    Paths[request.path][method] = { ...others, ...Paths[request.path][method] };
  }

  // parameters
  let parameters = Paths[request.path][method].parameters as any[];
  if (request.query) {
    Object.keys(request.query).map((key) => {
      if (!parameters.some((v) => v.name === key)) {
        const isPath = request.path
          .split('/')
          .filter((pathName) => pathName === `{${key}}`).length;

        let schema = isPath ? pathInfo?.[key] : queryInfo?.[key];

        if (!schema) {
          schema = { schema: {}};
        }
        if (!schema.schema.type && request.query?.[key]) {
         schema.schema = {
          ...valueToSwaggerType(request.query[key]),
           ...schema.schema,
         };
        }
        if (!schema.schema.example && request.query?.[key]) {
          schema.schema.example = request.query[key];
        }

        parameters = [
          ...parameters,
          {
            in: isPath ? 'path' : 'query',
            name: key,
            ...schema,
          },
        ];
      }
    });
  }

  if (request.body && !parameters.some((v) => v.in === 'body')) {
    const schema = bodyInfo || {
      schema: { type: 'object' }
    };
    if (!schema.schema.properties) {
      const properties = Object.keys(request.body).map(key => {
        return { [key]: valueToSwaggerType(request.body?.[key]) }
      }).reduce((prev, current) => {
        const key = Object.keys(current)[0];
        prev[key] = current[key];
        return prev;
      }, {});
      schema.schema.properties = properties;
    }
    if (!schema.schema.example) {
      schema.schema.example = request.body;
    }
    parameters = [
      ...parameters,
      {
        in: 'body',
        ...schema,
      },
    ];
  }

  Paths[request.path][method].parameters = parameters;

  // response
  let responses = Paths[request.path][method].responses;

  if (response.json && responseInfo) {
    if (
      responseInfo.content?.['application/json'] &&
      !responseInfo.content['application/json'].example
    ) {
      responseInfo.content['application/json'].example = response.json;
    }
    responses = {
      ...responses,
      [response.statusCode]: responseInfo,
    };
  }
  else if(response.json) {
    responses = {
      ...responses,
      [response.statusCode]: {
        content: {
          'application/json': {
            example: response.json,
          }
        }
      }
    }
  }

  Paths[request.path][method].responses = responses;

  FileUtil.saveTemporary(request, Paths);
};
