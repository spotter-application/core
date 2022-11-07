const { expect } = require('chai');
const { detectState } = require('../lib/stdout-manipulator');

describe('stdout-manipulator', () => {
    describe('detectState', () => {
        it('Should not detect anything for an empty line', async () => {
            const state = detectState('');
            expect(state).to.deep.equal({
                compilationStarted: false,
                compilationError: false,
                compilationComplete: false,
                fileEmitted: null,
            });
        });

        it('Should not detect anything for an unknown line', async () => {
            const state = detectState('tsc: unknown statement');
            expect(state).to.deep.equal({
                compilationStarted: false,
                compilationError: false,
                compilationComplete: false,
                fileEmitted: null,
            });
        });

        describe('Tested with typescript 4.5.5', () => {
            it('Should detect a compilation start', async () => {
                const { compilationStarted } = detectState('[\x1B[90m11:32:11 AM\x1B[0m] Starting compilation in watch mode...');
                expect(compilationStarted).to.equal(true);
            });

            it('Should detect a compilation error', async () => {
                const { compilationError } = detectState('\x1B[96mmodules/file.ts\x1B[0m:\x1B[93m17\x1B[0m:\x1B[93m49\x1B[0m - \x1B[91merror\x1B[0m\x1B[90m TS2345: \x1B[0mArgument of type \'string\' is not assignable to parameter of type \'never\'.');
                expect(compilationError).to.equal(true);
            });

            it('Should detect a compilation complete', async () => {
                const { compilationComplete } = detectState('[\x1B[90m11:32:26 AM\x1B[0m] Found 4 errors. Watching for file changes.');
                expect(compilationComplete).to.equal(true);
            });

            it('Should detect an emitted file', async () => {
                const { fileEmitted } = detectState('TSFILE: /my/dist/hello.js');
                expect(fileEmitted).to.equal('/my/dist/hello.js');
            });
        })
    });
});
