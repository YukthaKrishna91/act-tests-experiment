const fs = require('fs');
const path = require('path');
const { exec, execSync } = require('child_process');
const util = require('util');

// Promisify exec to use async/await
const execPromise = util.promisify(exec);

function cloneTestPacks(localPath) {
  execSync(
    `git clone git@github.com:bbc/act-test-packs.git ${localPath}`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error cloning repo: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    }
  );
}

function deleteTestPacks(localPath) {
  execSync(`rm -rf ${localPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error cloning repo: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
}

function getMonorepoLatest() {
  const pathPrefix = '/act/test/monorepo/latest/PATH_TO_TEST';

  const latestMonorepoTestURLs = [];
  const stagedTests = [];

  function walk(dir) {
    const subDirs = fs
      .readdirSync(dir, { withFileTypes: true, recursive: true })
      .filter((d) => d.isDirectory());

    subDirs.forEach((subDir) => {
      if (subDir.name !== 'lib') {
        walk(path.join(subDir.parentPath, subDir.name));
      }
    });

    if (subDirs.length === 0) {
      const cleanDir = dir.replace('src/', '');
      const payLoadPath = dir + '/payload.js';
      if (fs.existsSync(payLoadPath)) {
        if (payLoadPath.includes('_staged')) {
          stagedTests.push(`/src/${cleanDir}`);
        } else {
          latestMonorepoTestURLs.push(pathPrefix.replace('PATH_TO_TEST', cleanDir));
        }
      }
    }

    return { latestMonorepoTestURLs, stagedTests };
  }

  return walk('./src');
}

async function checkPacksForTest(test, folder) {
  try {
    const command = `grep -r "${test}" ${folder}`;
    const { stdout, stderr } = await execPromise(command);

    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }

    if (!stdout || stdout.includes('No such file or directory')) {
      return test;
    }
  } catch (error) {
    if (error.code === 1) {
      // If grep returns 1, it means no match was found
      return test;
    } else {
      console.error('Error executing grep:', error.message);
    }
  }
}

const { latestMonorepoTestURLs, stagedTests } = getMonorepoLatest();

const TEST_PACK_PATH = './scripts/hold';

if (!fs.existsSync(path.join(TEST_PACK_PATH, '/README.md'))) {
  cloneTestPacks(TEST_PACK_PATH);
}

const monorepoPack = [];
const allUnversionedPack = [];
const otherPacks = [];

latestMonorepoTestURLs.forEach((test) => {
  try {
    monorepoPack.push(
      checkPacksForTest(test, path.join(TEST_PACK_PATH, 'src/tv-certification/monorepo.json'))
    );
    allUnversionedPack.push(
      checkPacksForTest(test, path.join(TEST_PACK_PATH, 'src/all_unversioned.json'))
    );
    otherPacks.push(checkPacksForTest(test, path.join(TEST_PACK_PATH, 'src/tv-certification')));
  } catch (e) {
    console.log(e);
  }
});

const prettify = (json) => JSON.stringify(json, null, '  ');

Promise.all([Promise.all(monorepoPack), Promise.all(allUnversionedPack), Promise.all(otherPacks)])
  .then(([monorepoResults, allUnversioned, otherPacksResults]) => {
    // Filter and log the results
    const notInMonorepoPack = monorepoResults.filter((test) => !!test);
    const notInAllUnversionedPack = allUnversioned.filter((test) => !!test);
    const notInOtherPacks = otherPacksResults.filter((test) => !!test);
    console.log('\nThe following are not in the monorepo test pack;', prettify(notInMonorepoPack));
    console.log(
      '\nThe following are not in the all_unversioned test pack;',
      prettify(notInAllUnversionedPack)
    );
    console.log(
      '\nThe following are not in any of the other test packs (e.g. approved or spec specific);',
      prettify(notInOtherPacks)
    );
    const notInAnyPack = notInOtherPacks.filter(
      (test) => notInAllUnversionedPack.includes(test) || notInMonorepoPack.includes(test)
    );
    console.log('\nThe following are not in any test pack;', prettify(notInAnyPack));

    console.log(
      '\nThe following are in the _staged directory which indicates they should not be a test pack;',
      prettify(stagedTests)
    );

    deleteTestPacks(TEST_PACK_PATH);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
