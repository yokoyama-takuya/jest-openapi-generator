import path from 'path';
import fs from 'fs-extra';
import yaml from 'js-yaml';
import { Request } from './type';

const temporaryPath = path.resolve(process.cwd(), '.jest-openapi-generator');

const temporaryFilePath = (request: Request): string => {
  const path = request.path.replace(/\//g, '-');
  const fileName = `/${path}.yaml`;
  return temporaryPath + fileName;
}

const readTemporary = <T = any>(request: Request):T | void  => {
  try {
    const data = fs.readFileSync(temporaryFilePath(request), 'utf-8');
    return yaml.load(data) as T;
  } catch {
    // nothing to do
    return;
  }
}

const saveTemporary = (request: Request, data: any): void => {
  try {
    fs.outputFileSync(temporaryFilePath(request), yaml.dump(data));
  } catch (e) {
    console.error(e);
  }
}

const FileUtil = {readTemporary, saveTemporary};

export default FileUtil;
