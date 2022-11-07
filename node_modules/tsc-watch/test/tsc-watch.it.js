const { expect } = require('chai');
const sinon = require('sinon');
const { driver } = require('./driver');

describe('TSC-Watch child process messages', () => {
  afterEach(() => driver.reset());

  it('Should send "started" on compilation start', async () => {
    const listener = sinon.stub();
    driver.subscribe('started', listener).startWatch().modifyAndSucceedAfter(1000);
    await driver.wait(4000);

    expect(listener.callCount).to.be.equal(2);
  });

  it('Should send "first_success" on first success', async () => {
    const listener = sinon.stub();
    driver.subscribe('first_success', listener).startWatch().modifyAndSucceedAfter(1000);
    await driver.wait(3000);
    expect(listener.callCount).to.be.equal(1);
  });

  it('Should send "success" on subsequent successes', async () => {
    const listener = sinon.stub();
    driver.subscribe('success', listener).startWatch().modifyAndSucceedAfter(1000);
    await driver.wait(3000);
    expect(listener.callCount).to.be.equal(2);
  });

  it('Should send "compile_errors" when tsc compile errors occur', async () => {
    const listener = sinon.stub();
    driver
      .subscribe('compile_errors', listener)
      .startWatch({ failFirst: true })
      .modifyAndFailAfter(1500);

      await driver.wait(3000);
      expect(listener.callCount).to.be.equal(2);
  });

  it('Should send "compile_errors" when pretty param was set', async () => {
    const listener = sinon.stub();
    driver.subscribe('compile_errors', listener).startWatch({ failFirst: true, pretty: true });
    await driver.wait(3000);
    expect(listener.callCount).to.be.equal(1);
  });
});
