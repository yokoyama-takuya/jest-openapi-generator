import yaml from 'js-yaml';
import fs from 'fs-extra';
import path from 'path';
import { Request, Response } from './type';
import { generator } from './generator';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Reporter from './reporter';

describe('reporter', () => {
  it('success', () => {
    const request: Request = { method: 'GET', path: '/r1' }
    const response: Response = { statusCode: 200, json: {} }
    generator(request, response);
    const reporter = new Reporter({}, { silent: true });
    reporter.onRunComplete();
    const exportFile = path.resolve(process.cwd(), './swagger.yaml');
    const result: any = yaml.load(fs.readFileSync(exportFile, 'utf-8'));
    expect(Object.keys(result.paths).length).toBeGreaterThanOrEqual(1);
    fs.removeSync(exportFile);
  })
  it('use output option', () => {
    const request: Request = { method: 'GET', path: '/r1' }
    const response: Response = { statusCode: 200, json: {} }
    generator(request, response);
    const reporter = new Reporter({}, { silent: true, output: 'swagger.json' });
    reporter.onRunComplete();
    const exportFile = path.resolve(process.cwd(), 'swagger.json');
    const result: any = JSON.parse(fs.readFileSync(exportFile, 'utf-8'));
    expect(Object.keys(result.paths).length).toBeGreaterThanOrEqual(1);
    fs.removeSync(exportFile);
  })
})