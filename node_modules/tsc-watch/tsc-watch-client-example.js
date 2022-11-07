const readline = require('readline');
const TscWatchClient = require('./client');
const client = new TscWatchClient();

client.on('started', () => {
  console.log('Compilation started');
});

client.on('first_success', () => {
  console.log('Interactive mode');
  console.log('  Press "r" to re-run the onSuccess command, esc to exit.\n');
});

client.on('success', () => {
  console.log('Yey success!');
});

client.on('compile_errors', () => {
  console.log('Ho no!');
});

client.start(
  '--onSuccess',
  'node ./example/main.js',
  '--noClear',
  '--project',
  './example/tsconfig.json',
);

readline.emitKeypressEvents(process.stdin);
process.stdin.on('keypress', (str, key) => {
  if (key.name == 'escape' || (key && key.ctrl && key.name == 'c')) {
    client.kill();
    process.stdin.pause();
  } else {
    if (str && str.toLowerCase() === 'r') {
      client.runOnSuccessCommand();
    }
  }
});

process.stdin.setRawMode(true);
process.stdin.resume();
