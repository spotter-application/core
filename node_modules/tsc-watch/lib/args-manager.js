function removeRunnerArgs(args) {
  return args.splice(2); // removing "node tsc-watch.js"
}

function getCommandIdx(args, command) {
  const lowerCasedCommand = command.toLowerCase();
  return args.map(arg => arg.toLowerCase()).indexOf(lowerCasedCommand);
}

function isCommandExist(args, command) {
  return getCommandIdx(args, command) > 0;
}

function hasWatchCommand(args) {
  return isCommandExist(args, '-w') || isCommandExist(args, '--watch');
}

function forceWatch(args) {
  if (!hasWatchCommand(args)) {
    args.push('--watch');
  }

  return args;
}

function extractCommandWithValue(args, command) {
  let commandIdx = getCommandIdx(args, command);
  let commandValue = null;
  if (commandIdx > -1) {
    commandValue = args[commandIdx + 1];
    args.splice(commandIdx, 2);
  }
  return commandValue;
}

function extractCommand(args, command) {
  let commandIdx = getCommandIdx(args, command);
  if (commandIdx > -1) {
    args.splice(commandIdx, 1);
    return true;
  }
  return false;
}

function extractArgs(args) {
  const allArgs = forceWatch(removeRunnerArgs(args));

  const onFirstSuccessCommand = extractCommandWithValue(allArgs, '--onFirstSuccess');
  const onSuccessCommand = extractCommandWithValue(allArgs, '--onSuccess');
  const onFailureCommand = extractCommandWithValue(allArgs, '--onFailure');
  const onCompilationStarted = extractCommandWithValue(allArgs, '--onCompilationStarted');
  const onCompilationComplete = extractCommandWithValue(allArgs, '--onCompilationComplete');
  const maxNodeMem = extractCommandWithValue(allArgs, '--maxNodeMem');
  const noColors = extractCommand(allArgs, '--noColors');
  const noClear = extractCommand(allArgs, '--noClear');
  const silent = extractCommand(allArgs, '--silent');
  let compiler = extractCommandWithValue(allArgs, '--compiler');
  if (!compiler) {
    compiler = 'typescript/bin/tsc';
  } else {
    compiler = require.resolve(compiler, { paths: [process.cwd()] });
  }

  return {
    onFirstSuccessCommand: onFirstSuccessCommand,
    onSuccessCommand: onSuccessCommand,
    onFailureCommand: onFailureCommand,
    onCompilationStarted: onCompilationStarted,
    onCompilationComplete: onCompilationComplete,
    maxNodeMem: maxNodeMem,
    noColors: noColors,
    noClear: noClear,
    silent: silent,
    compiler: compiler,
    args: allArgs,
  };
}

module.exports = {
  extractArgs: extractArgs,
  isCommandExist: isCommandExist,
  hasWatchCommand: hasWatchCommand,
};
