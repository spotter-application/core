const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath) === false) {
  console.error(`package.json was not found at "${packageJsonPath}"`);
}

const run = (command, options) => execSync(command, { encoding: 'utf8', ...options });

const getHashFor = branchName => run(`git rev-parse --verify ${branchName}`).trim();

function ensurePackageJsonHasNoChanges() {
  if (run(`git status -s ${packageJsonPath}`).length) {
    console.error('First, commit your package.json');
    process.exit(1);
  }
}

function ensureNothingStaged() {
  if (run(`git diff --name-only --cached`).length) {
    console.error('You need to push your staged changes first');
    process.exit(1);
  }
}

function bumpVersion(version, upgradeType) {
  let [major, minor, patch] = version.split('.').map(x => parseInt(x, 10));

  switch (upgradeType) {
    case 'major':
      return `${major + 1}.0.0`;

    case 'minor':
      return `${major}.${minor + 1}.0`;

    case 'patch':
      return `${major}.${minor}.${patch + 1}`;

    default:
      return `${major}.${minor}.${patch}`;
  }
}

function upgradePackageJson(upgradeType) {
  const packageJson = require(packageJsonPath);
  const { version } = packageJson;
  const newVersion = bumpVersion(version, upgradeType);
  packageJson.version = newVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`[${upgradeType}] Version bumped from ${version} to ${packageJson.version}`);
  return newVersion;
}

function commitPackageJson(newVersion) {
  run(`git add ${packageJsonPath}`);
  run(`git commit ${packageJsonPath} -m "Version v${newVersion}"`);
  run(`git tag -a v${newVersion} -m "Version v${newVersion}"`);
  run(`git push origin master --tags`);
}

let upgradeType = 'patch';
if (process.argv.length === 3) {
  upgradeType = process.argv[2].toLowerCase();
  if (['major', 'minor', 'patch'].indexOf(upgradeType) === -1) {
    console.error(`\nSyntax: node release.js UPGRADE_TYPE\n`);
    console.error(`   UPGRADE_TYPE: major | minor | patch.      default: patch\n\n`);
    process.exit(1);
  }
}

ensureNothingStaged();
ensurePackageJsonHasNoChanges();
const newVersion = upgradePackageJson(upgradeType);
commitPackageJson(newVersion);
