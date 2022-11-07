# @gilamran/tsc-watch CHANGELOG

## v5.0.2 - 03/04/2022

- Fixed black on black issue (Thanks to @bonjourjoel for the [issue](https://github.com/gilamran/tsc-watch/issues/142))

## v5.0.1 - 03/04/2022

- bumped to version 5.0.1 to prevent dev version as the latest version

## v4.6.2 - 10/01/2022

- Added `file_emitted` signal support when `--listEmittedFiles` is used [issue](https://github.com/gilamran/tsc-watch/issues/138)
- Added client new event `file_emitted` with the emitted file path

## v4.6.1 - 10/3/2022

- Added `--maxNodeMem` param to set manually node allocated memory [issue](https://github.com/gilamran/tsc-watch/issues/137) - (Thanks to @pp0rtal for the idea and the PR!)

## v4.6.0 - 20/12/2021

- Added `silent` option - (Thanks to @axtk for the idea and @fmvilas for the PR)

## v4.5.0 - 19/8/2021

- Added `onCompilationStarted` option - (Thanks to @axtk for the idea and @dko-slapdash for the PR)
- Fix: enable unit tests which were turned off accidentally

## v4.4.0 - 26/5/ 2021

- tsc-watch is now listening to message and reacts to them

## v4.3.1 - 26/5/2021

- Fix: compiler resolving  - (Thanks to @merceyz for the PR)

## v4.2.9 - 23/6/2020

- Fix: upgrade cross-spawn and strip-ansi (node 8+)  - (Thanks to @FauxFaux for the PR)

## v4.2.8 - 23/5/2020

- Fix: spawn compiler using node, this fixes issues with yarn v2 (pnp) - (Thanks to @merceyz)

## v4.2.6 - 18/5/2020

- Using number 15 instead of SIGTERM to support POSIX standard - (Thanks to @Asarew)

## v4.2.0 - 29/2/2020

- Using readline instead of raw stdout buffer - (Thanks to @Janpot for the idea)

## v4.1.0 - 22/1/2020

- Added the `onCompilationComplete` option - (Thanks to @ackvf for the idea)

## v4.0.0 - 19/9/2019

- Terminating previous processes is now done with `SIGTERM` instead of `SIGUSR2` - (Thanks to @zontarian)

## v3.0.0 - 9/9/2019

- onSuccess will run on EVERY successful compilation, also on the first success - (Thanks to @mchl-hub for the idea)

## v2.2.1 - 19/5/2019

- Force kill when on windows - (Thanks to @hwwi)

## v2.2.0 - 13/5/2019

- Waiting for all the child processes to showdown before closing - (Thanks to @MartinLoeper)

## v2.1.0 - 12/2/2019

- Exporting TscWatchClient for multiple instance of `tsc-watch` - (Thanks to @pronebird)

## v2.0.0 - 12/2/2019

- As many users requested, from now on `--onFirstSuccess` process will not get killed, only when tsc-watch is killed. (Based on @amir-arad's PR)
This version fixes Issue #20, #21 and #50.

## v1.1.37 - 8/2/2019

- Fixed coloring issues

## v1.1.36 - 31/1/2019

- `--watch` will be added to the end of the arguments (Thanks to @barkayal)

## v1.1.35 - 28/1/2019

- Clean code

## v1.1.32 - 27/11/2018

- Added --noClear command to prevent clearing the screen after each compilation

## v1.0.32 - 27/11/2018

- Removed chalk dependency - (Thanks to @frank-orellana)

## v1.0.31 - 27/11/2018

- Upgraded ps-tree, preventing flatmap-stream attack (Thanks to @jeremyhon)

## v1.0.30 - 10/10/2018

- Added custom compiler ability (Thanks to @sosoba for the PR)

## v1.0.29 - 25/09/2018

- Fixed regression bug (Thanks to @onehorsetown)

## v1.0.28 - 25/09/2018

- Fixed command args extraction (Thanks to @mscharley)

## v1.0.27 - 27/08/2018

- Fixed process termination (Thanks to @igrayson)

## v1.0.26 - 20/07/2018

- Fixed several issues with hadErrors check (Thanks to @tombousso)

## v1.0.24 - 20/07/2018

- Killing onFail and onSuccess after compilation

## v1.0.23 - 1/06/2018

- Typescript as a peer dependency (Thanks to @asztal)

## v1.0.22 - 1/06/2018

- Added support for Typescript 2.9+

## v1.0.21 - 16/04/2018

- Removed `--noClearScreen` argument, as typescript added `--preserveWatchOutput`

## v1.0.20 - 16/04/2018

- Fixed ignoring the last arg
- Added `--noColors` argument
- Added `--noClearScreen` argument

## v1.0.19 - 8/04/2018

- Fixed passing compilation when using --pretty param (Thanks to @tomaba)

## v1.0.17 - 27/01/2018

- Terminating typescript on SIGTERM event (Thanks to @amir-arad)

## v1.0.16 - 27/01/2018

- Fixed stdout coloring issues on Mac (Thanks to @jonaskello)

## v1.0.15 - 18/01/2018

- Added `--onFailure` argument

## v1.0.14 - 18/01/2018

- Fixed Windows newline issue

## v1.0.9 - 5/12/2017

- Add CHANGELOG
- Fix typo in package description
- Upgraded chalk version
- Change main to `index.js`
- Removed `yarn.lock` & `package-lock.json`
- Made `index.js` executable
