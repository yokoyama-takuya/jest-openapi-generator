"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const temporaryPath = path_1.default.resolve(process.cwd(), '.jest-openapi-generator');
const temporaryFilePath = (request) => {
    const path = request.path.replace(/\//g, '-');
    const fileName = `/${path}.yaml`;
    return temporaryPath + fileName;
};
const readTemporary = (request) => {
    try {
        const data = fs_extra_1.default.readFileSync(temporaryFilePath(request), 'utf-8');
        return js_yaml_1.default.load(data);
    }
    catch (_a) {
        // nothing to do
        return;
    }
};
const saveTemporary = (request, data) => {
    try {
        fs_extra_1.default.outputFileSync(temporaryFilePath(request), js_yaml_1.default.dump(data));
    }
    catch (e) {
        console.error(e);
    }
};
const FileUtil = { readTemporary, saveTemporary };
exports.default = FileUtil;
//# sourceMappingURL=file_util.js.map