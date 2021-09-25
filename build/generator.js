"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generator = void 0;
const file_util_1 = __importDefault(require("./file_util"));
const valueToSwaggerType = (value) => {
    const type = typeof value;
    switch (type) {
        case 'string':
        case 'number':
        case 'object':
            return {
                type,
                // TODO: add format etc...
            };
        default: {
            return {};
        }
    }
};
const generator = (request, response, info) => {
    var _a;
    const Paths = file_util_1.default.readTemporary(request) || {};
    if (!Paths[request.path]) {
        Paths[request.path] = {};
    }
    const method = request.method.toLowerCase();
    const _b = JSON.parse(JSON.stringify(info || {})), { path: pathInfo, query: queryInfo, body: bodyInfo, response: responseInfo } = _b, others = __rest(_b, ["path", "query", "body", "response"]);
    if (!Paths[request.path][method]) {
        Paths[request.path][method] = { parameters: [], responses: {} };
    }
    if (others) {
        Paths[request.path][method] = Object.assign(Object.assign({}, others), Paths[request.path][method]);
    }
    // parameters
    let parameters = Paths[request.path][method].parameters;
    if (request.query) {
        Object.keys(request.query).map((key) => {
            var _a, _b;
            if (!parameters.some((v) => v.name === key)) {
                const isPath = request.path
                    .split('/')
                    .filter((pathName) => pathName === `{${key}}`).length;
                let schema = isPath ? pathInfo === null || pathInfo === void 0 ? void 0 : pathInfo[key] : queryInfo === null || queryInfo === void 0 ? void 0 : queryInfo[key];
                if (!schema) {
                    schema = { schema: {} };
                }
                if (!schema.schema.type && ((_a = request.query) === null || _a === void 0 ? void 0 : _a[key])) {
                    schema.schema = Object.assign(Object.assign({}, valueToSwaggerType(request.query[key])), schema.schema);
                }
                if (!schema.schema.example && ((_b = request.query) === null || _b === void 0 ? void 0 : _b[key])) {
                    schema.schema.example = request.query[key];
                }
                parameters = [
                    ...parameters,
                    Object.assign({ in: isPath ? 'path' : 'query', name: key }, schema),
                ];
            }
        });
    }
    Paths[request.path][method].parameters = parameters;
    // body
    if (request.body && !Paths[request.path][method].requestBody) {
        const requestBody = bodyInfo || {
            content: {}
        };
        if (Object.keys(requestBody.content).length === 0) {
            requestBody.content['application/json'] = { schema: { type: 'object' } };
        }
        const defaultProperties = Object.keys(request.body).map(key => {
            var _a;
            return { [key]: valueToSwaggerType((_a = request.body) === null || _a === void 0 ? void 0 : _a[key]) };
        }).reduce((prev, current) => {
            const key = Object.keys(current)[0];
            prev[key] = current[key];
            return prev;
        }, {});
        Object.keys(requestBody.content).forEach(k => {
            var _a, _b, _c;
            if (!((_a = requestBody.content[k]) === null || _a === void 0 ? void 0 : _a.schema)) {
                requestBody.content[k].schema = { type: 'object' };
            }
            if (!((_b = requestBody.content[k].schema) === null || _b === void 0 ? void 0 : _b.properties)) {
                requestBody.content[k].schema.properties = defaultProperties;
            }
            if (!((_c = requestBody.content[k].schema) === null || _c === void 0 ? void 0 : _c.example)) {
                requestBody.content[k].schema.example = request.body;
            }
        });
        Paths[request.path][method].requestBody = requestBody;
    }
    // response
    let responses = Paths[request.path][method].responses;
    if (response.json && responseInfo) {
        if (((_a = responseInfo.content) === null || _a === void 0 ? void 0 : _a['application/json']) &&
            !responseInfo.content['application/json'].example) {
            responseInfo.content['application/json'].example = response.json;
        }
        responses = Object.assign(Object.assign({}, responses), { [response.statusCode]: responseInfo });
    }
    else if (response.json) {
        responses = Object.assign(Object.assign({}, responses), { [response.statusCode]: {
                content: {
                    'application/json': {
                        example: response.json,
                    }
                }
            } });
    }
    Paths[request.path][method].responses = responses;
    file_util_1.default.saveTemporary(request, Paths);
};
exports.generator = generator;
//# sourceMappingURL=generator.js.map