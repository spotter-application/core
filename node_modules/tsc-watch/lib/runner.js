const spawn = require('cross-spawn');
const stringArgv = require('string-argv');
const killer = require('./killer');

function runCommand(fullCommand) {
  if (fullCommand) {
    const parts = stringArgv(fullCommand);
    const exec = parts[0];
    const args = parts.splice(1);
    return spawn(exec, args, {
      stdio: 'inherit',
    });
  }
}

function run(command) {
  const process = runCommand(command);
  const exitPromise = new Promise(resolve => process.on('exit', resolve));

  return function kill() {
    return Promise.all([killer(process), exitPromise]);
  };
}

module.exports = run;
