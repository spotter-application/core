const child_process = require('child_process');
const { expect } = require('chai');
const sinon = require('sinon');
const TscWatchClient = require('../lib/client');

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

describe('Client Events', () => {
  let watchClient;
  let callback;
  let sandbox;

  beforeEach(() => {
    watchClient = new TscWatchClient();
    callback = sinon.stub();
    sandbox = sinon.createSandbox();
  });
  afterEach(() => {
    watchClient.kill();
    sandbox.restore();
  });

  describe('Events', () => {
    it('Should emit "started" on compilation start', async () => {
      watchClient.on('started', callback);
      watchClient.start('--noClear', '--out', './tmp/output.js', './tmp/fixtures/failing.ts');
      await wait(2000)

      expect(callback.calledOnce).to.be.true;
    });

    it('Should emit "first_success" on first success', async () => {
      watchClient.on('first_success', callback);
      watchClient.start('--noClear', '--out', './tmp/output.js', './tmp/fixtures/passing.ts');
      await wait(2000)

      expect(callback.calledOnce).to.be.true;
    });

    it('Should emit "success" on first success', async () => {
      watchClient.on('success', callback);
      watchClient.start('--noClear', '--out', './tmp/output.js', './tmp/fixtures/passing.ts');
      await wait(2000)

      expect(callback.calledOnce).to.be.true;
    });

    it('Should deserialize and emit a "file_emitted" with the emitted file path', async function () {
      const forkSpy = sandbox.spy(child_process, 'fork');
      watchClient.on('file_emitted', callback);
      watchClient.start('--noClear', '--out', './tmp/output.js', './tmp/fixtures/passing.ts');
      const [ tscProcess ] = forkSpy.returnValues;
      tscProcess.emit('message', 'file_emitted:/dist/tmp/fixtures/passing.js')

      expect(callback.args).to.deep.equal([[ '/dist/tmp/fixtures/passing.js' ]]);
    });

    it('Should fire "compile_errors" on when tsc compile errors occur', async () => {
      watchClient.on('compile_errors', callback);
      watchClient.start('--noClear', '--out', './tmp/output.js', './tmp/fixtures/failing.ts');
      await wait(2000)

      expect(callback.calledOnce).to.be.true;
    });
  });
});
