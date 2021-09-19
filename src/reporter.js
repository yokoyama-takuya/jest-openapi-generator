/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs-extra');
const yaml = require('js-yaml');

module.exports = class Reporter {
  constructor(_, opts) {
    this.output = opts?.output;
    this.silent = opts?.silent;
}

  onRunComplete() {
    let template;
    try {
      const ymlConfig = path.resolve(process.cwd(), 'jest-openapi-generator.config.yaml');
      template = yaml.load(fs.readFileSync(ymlConfig, 'utf-8'));
    } catch {
      // nothing to do
    }
    try {
      const ymlConfig = path.resolve(process.cwd(), 'jest-openapi-generator.config.yml');
      template = yaml.load(fs.readFileSync(ymlConfig, 'utf-8'));
    } catch {
      // nothing to do
    }
    try {
      const jsonConfig = path.resolve(process.cwd(), 'jest-openapi-generator.config.json');
      template = JSON.parse(fs.readFileSync(jsonConfig, 'utf-8'));
    } catch {
      // nothing to do
    }

    if (!template) {
      if (!this.silent) {
        console.warn('[jest-openapi-generator] Missing jest-openapi-generator.config.yaml (or .json)');
      }
      template = {
        openapi: '3.0.0',
        info: {
          version: '1.0.0'
        }
      }
    }

    if (!template.paths) {
      template.paths = {};
    }

    try {
      const temporaryPath = path.resolve(process.cwd(), '.jest-openapi-generator');
      fs.readdirSync(temporaryPath).forEach(file => {
        const path = yaml.load(fs.readFileSync(temporaryPath + '/' + file, 'utf-8'));
        template.paths = {
          ...template.paths,
          ...path,
        }
      });
      const savePath = path.resolve(process.cwd(), this.output || './swagger.yaml');
      const expectType = savePath.split('.')[savePath.split('.').length - 1];
      let type;
      if (expectType === 'json') {
        type = 'json';
      }
      if (expectType === 'yaml' || expectType === 'yml') {
        type = 'yaml';
      }
      if (!type) {
        console.error('[jest-openapi-generator] Invalid export filename extension');
      }
      const data = type === 'json' ? JSON.stringify(template, null, '\t') : yaml.dump(template, null, '\t');
      fs.outputFileSync(savePath, data);
      fs.removeSync(temporaryPath);
      if (!this.silent) {
        console.log(`[jest-openapi-generator] Generated to ${savePath}`);
      }
    } catch (e) {
      console.log(e);
    }
  }
};