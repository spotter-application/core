const { expect } = require('chai');
const { extractArgs } = require('../lib/args-manager');

describe('Args Manager', () => {
  it('Should remove the runner args', () => {
    const { args } = extractArgs(['node', 'tsc-watch.js', '-d', '1.ts']);
    expect(args).to.deep.eq(['-d', '1.ts', '--watch']);
  });

  it('Should remove custom args', () => {
    const { args } = extractArgs(['node', 'tsc-watch.js', '--compiler', 'typescript/bin/tsc', '--nocolors', '--noclear', '--onsuccess', 'MY_SUCCESS', '--onfailure', 'MY_FAILURE', '--onfirstsuccess', 'MY_FIRST', '-d', '1.ts']);
    expect(args).to.deep.eq(['-d', '1.ts', '--watch']);
  });

  it('Should force watch', () => {
    const { args } = extractArgs(['node', 'tsc-watch.js', '1.ts']);
    expect(args.indexOf('--watch')).to.be.greaterThan(-1);
  });

  it('Should not change the argv order options if watch was not specified (fixes --build option)', () => {
    const { args } = extractArgs(['node', 'tsc-watch.js', '--build', '1.tsconfig.conf', '2.tsconfig.conf']);
    expect(args.indexOf('--build')).to.be.equal(0);
    expect(args.indexOf('--watch')).to.be.equal(3);
  });

  it('Should not re-add watch', () => {
    expect(extractArgs(['node', 'tsc-watch.js', '-w', '1.ts']).args.indexOf('-w')).to.be.greaterThan(-1);
    expect(extractArgs(['node', 'tsc-watch.js', '--watch', '1.ts']).args.indexOf('--watch')).to.be.greaterThan(-1);
    expect(extractArgs(['node', 'tsc-watch.js', '--watch', '1.ts']).args.indexOf('--watch')).to.be.greaterThan(-1);
  });

  it('Should return the onFirstSuccessCommand', () => {
    expect(extractArgs(['node', 'tsc-watch.js', '1.ts']).onFirstSuccessCommand).to.eq(null);
    expect(extractArgs(['node', 'tsc-watch.js', '--onFirstSuccess', 'COMMAND_TO_RUN', '1.ts']).onFirstSuccessCommand).to.eq('COMMAND_TO_RUN');
  });

  it('Should return the onSuccessCommand', () => {
    expect(extractArgs(['node', 'tsc-watch.js', '1.ts']).onSuccessCommand).to.eq(null);
    expect(extractArgs(['node', 'tsc-watch.js', '--onSuccess', 'COMMAND_TO_RUN', '1.ts']).onSuccessCommand).to.eq('COMMAND_TO_RUN');
  });

  it('Should return the onFailureCommand', () => {
    expect(extractArgs(['node', 'tsc-watch.js', '1.ts']).onFailureCommand).to.eq(null);
    expect(extractArgs(['node', 'tsc-watch.js', '--onFailure', 'COMMAND_TO_RUN', '1.ts']).onFailureCommand).to.eq('COMMAND_TO_RUN');
  });

  it('Should return the onCompilationStarted', () => {
    expect(extractArgs(['node', 'tsc-watch.js', '1.ts']).onCompilationStarted).to.eq(null);
    expect(extractArgs(['node', 'tsc-watch.js', '--onCompilationStarted', 'COMMAND_TO_RUN', '1.ts']).onCompilationStarted).to.eq('COMMAND_TO_RUN');
  });

  it('Should return the onCompilationComplete', () => {
    expect(extractArgs(['node', 'tsc-watch.js', '1.ts']).onCompilationComplete).to.eq(null);
    expect(extractArgs(['node', 'tsc-watch.js', '--onCompilationComplete', 'COMMAND_TO_RUN', '1.ts']).onCompilationComplete).to.eq('COMMAND_TO_RUN');
  });

  it('Should return the maxNodeMem', () => {
    expect(extractArgs(['node', 'tsc-watch.js', '1.ts']).maxNodeMem).to.eq(null);
    expect(extractArgs(['node', 'tsc-watch.js', '--maxNodeMem', '1024']).maxNodeMem).to.eq('1024');
  });

  it('Should return the noColors', () => {
    expect(extractArgs(['node', 'tsc-watch.js', '1.ts']).noColors).to.eq(false);
    expect(extractArgs(['node', 'tsc-watch.js', '--noColors', '1.ts']).noColors).to.eq(true);
  });

  it('Should return the noClear', () => {
    expect(extractArgs(['node', 'tsc-watch.js', '1.ts']).noClear).to.eq(false);
    expect(extractArgs(['node', 'tsc-watch.js', '--noClear', '1.ts']).noClear).to.eq(true);
  });

  it('Should return the silent', () => {
    expect(extractArgs(['node', 'tsc-watch.js', '1.ts']).silent).to.eq(false);
    expect(extractArgs(['node', 'tsc-watch.js', '--silent', '1.ts']).silent).to.eq(true);
  });

  it('Should return the compiler', () => {
    expect(extractArgs(['node', 'tsc-watch.js', '1.ts']).compiler).to.eq('typescript/bin/tsc');
    expect(extractArgs(['node', 'tsc-watch.js', '--compiler', 'typescript/lib/tsc', '1.ts']).compiler).to.eq(require.resolve('typescript/lib/tsc'));
  });
});
