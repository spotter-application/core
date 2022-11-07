const psTree = require('ps-tree');
const spawn = require('cross-spawn');
const { exec } = require('child_process');

let KILL_SIGNAL = '15'; // SIGTERM
let hasPS = true;

const isWindows = process.platform === 'win32';

// discover if the OS has `ps`, and therefore can use psTree
exec('ps', function(error) {
  if (error) {
    hasPS = false;
  }
});

module.exports = function kill(child) {
  return new Promise(resolve => {
    if (isWindows) {
      exec('taskkill /pid ' + child.pid + ' /T /F', resolve);
    } else {
      if (hasPS) {
        psTree(child.pid, function(err, kids) {
          spawn('kill', ['-' + KILL_SIGNAL, child.pid].concat( kids.map(p => p.PID) )).on('close', resolve);
        });
      } else {
        exec('kill -' + KILL_SIGNAL + ' ' + child.pid, resolve);
      }
    }
  });
};
