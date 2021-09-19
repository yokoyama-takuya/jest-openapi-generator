/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs-extra');

const temporaryPath = path.resolve(process.cwd(), '.jest-openapi-generator');

module.exports = class Reporter {
  onRunComplete() {
    fs.removeSync(temporaryPath);
  }
};
