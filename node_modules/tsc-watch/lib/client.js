const child_process = require('child_process');
const EventEmitter = require('events');

class TscWatchClient extends EventEmitter {
  start(...args) {
    this.tsc = child_process.fork(require.resolve('./tsc-watch.js'), args, { stdio: 'inherit' });
    this.tsc.on('message', (msg) => this.emit(...deserializeTscMessage(msg)));
    this.tsc.on('exit', (code, signal) => this.emit('exit', code, signal));
  }

  kill() {
    if (this.tsc && this.tsc.kill) {
      this.tsc.kill();
    }
    this.removeAllListeners();
  }

  runOnCompilationStartedCommand() {
    if (this.tsc) {
      this.tsc.send('run-on-compilation-started-command');
    }
  }

  runOnCompilationCompleteCommand() {
    if (this.tsc) {
      this.tsc.send('run-on-compilation-complete-command');
    }
  }

  runOnFirstSuccessCommand() {
    if (this.tsc) {
      this.tsc.send('run-on-first-success-command');
    }
  }

  runOnFailureCommand() {
    if (this.tsc) {
      this.tsc.send('run-on-failure-command');
    }
  }

  runOnSuccessCommand() {
    if (this.tsc) {
      this.tsc.send('run-on-success-command');
    }
  }
}

function deserializeTscMessage(strMsg){
  const indexOfSeparator = strMsg.indexOf(':');
  if(indexOfSeparator === -1){
    return [strMsg];
  }

  return [strMsg.substring(0, indexOfSeparator), strMsg.substring(indexOfSeparator + 1)]
}

module.exports = TscWatchClient;
