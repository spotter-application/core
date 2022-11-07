const fse = require('fs-extra');

before(() =>
  fse.copySync(`${process.cwd()}/test/fixtures`, `${process.cwd()}/tmp/fixtures`));

after(() =>
  fse.removeSync(`${process.cwd()}/tmp`));
