# ACT Tests

> [!CAUTION]
> Please contact Barn Owls before doing a versioned release.

This repository aims to bring most, if not all, of the tests written for ACT under one repo with a single build system to aid with the discoverability of tests and the understanding of their coverage against the relevant BBC TV published specifications.

## Develop

To start the dev server and open the ACT tests locally, run:

```sh
npm run dev
```

To run unit tests locally, run:

```sh
npm t
```

1. All tests should be independent from one another and not rely on external code
2. No polyfills or shims should be used within tests
3. No build tools like bundling, transpilation or minification should be included

Ideally all tests should feature in a test pack. When adding new tests, intended for partners, remember to add a reference for the test to the appropriate test pack.

New tests which are a work in progress should be added to the `\_staged` folder. The `\_staged` folder houses tests which are not currently part of a test pack but need to be kept for future.

### Tutorials and Examples

- Tutorial: [Using multi-check tests](./lib/multicheck-test/USING_TEST.md)
- Tutorial: [Using test templates](./lib/multicheck-test/USING_TEST_TEMPLATE.md)
- Example: [Media test templates](./templates/web-apis/media/)
- Tutorial: [Using Manifest APIs](./lib/manifest/USING_MANIFEST_APIS.md)
- Example: [Using SegmentSource](./src/_staged/web-apis/video/_examples/using-segment-source/payload.js)
- Example: [Using ChunkSource](./src/_staged/web-apis/video/_examples/using-chunk-source/payload.js)
- Tutorial: [Using a MediaElement](./lib/media-element/USING_MEDIA_ELEMENT.md)
- Tutorial: [Using a MediaSource](./lib/media-source/USING_MEDIA_SOURCE.md)
- Tutorial: [Using SourceBuffers](./lib/source-buffer/USING_SOURCE_BUFFERS.md)

## Test

PRs build to `/act/test/monorepo/branch={{branch_name}}`. You can launch them in the ACT Portal with a custom test list. Use `test-url` to create a URL containing all **pushed changes** from `main`:

```sh
./scripts/test-url.sh
```

> [!IMPORTANT]
> This script returns a URL to the `certification.test` portal. To run the tests on a device you need to use the `certification.test` ACT client too.  
> Use https://certification.test.bbctvapps.co.uk/act/client/, **not** https://certification.bbctvapps.co.uk/act/client/.

For more control, you can create a URL to _any_ published monorepo tests using `build-test-url`. For example:

```sh
# f.ex. build a URL to all ACT tests on 'latest' that use a media element:
node ./scripts/build-test-url.js src/web-apis/video/**/* src/web-apis/audio/**/*
```

Use the help option (`-h`) to see all the capabilities:

```sh
# see options
node ./scripts/build-test-url.js -h
```

You can also use the [Rapid Prototyping Tool (RPT)](https://certification.bbctvapps.co.uk/act/devhub/rpt/) to test out code on a device. Copy paste a test's **build** code into the RPT. You can find the latest build of a test on your branch with:

```
https://certification.test.bbctvapps.co.uk/act/test/monorepo/branch={{branch_name}}/{{test_path}}/payload.js
```

Once you've obtained an ACT log file, you may find it easier to read through with this script:

```sh
node ./scripts/format-act-log.js ~/Downloads/ACT-1737.json
# tip: drag and drop the log file into the terminal to quickly insert the path
```

## Publish internally

> [!CAUTION]
> Please don't create ACT IDs before you're certain of your test's location in the monorepo file structure. Cleaning up ACT IDs is not easily reversible, and ACT IDs are keyed of the test's path.

Every ACT test needs a test ID. Use the `act-id.sh` script to create an ID for a new test:

```sh
npm run id <manifest.json>

# or, if you want to check you're ready:
DRY_RUN=true npm run id <manifest.json>
```

To add a changelog entry to multiple manifests, run:

```sh
npm run apply-change <patch_json> <...manifests_json>
```

To format manifests into `.csv` or `.tsv` files, run:

```sh
jq --raw-output --null-input --from-file ./scripts/format-manifest.jq ./src/**/manifest.json > manifestFields.csv
```

To find tests that aren't in any test packs, run:

```sh
npm run get-unpacked-tests
```

## Versioning

The repo is versioned in it's entirety i.e. all tests are versioned under the same number. The repo version is a combination of the current Specification version and the release of this repo under that specification version. If the Spec is at `v26.0.1` and this repo has been released 5 times, the overall repo version would be `v26.0.1-5`.

When the specification version is updated the release number of the repo is set back to 0 i.e. if the spec is bumped to `v26.0.2` the repo version would be `v26.0.2-0`.

## Deployment

Deployments can be made either to a version number (e.g. v1.2.3-4) or under the `latest` key word. For both cases the entire repo will be uploaded i.e. all tests in `src`.

Deployments to `latest` will overwrite the previous tests deployed there. Any commit to main will trigger a deployment of all tests to `latest`. Therefore, `latest` will always reflect the tests as they are on the `main` branch. Deployments to `latest` are useful for testing prior to making a versioned release.

Deployments to a specific version number will never be overwritten. These deployments are to be used in tests packs sent to partners. Only commits which bump the github tag will cause a deployment of all tests to the new version number. To bump the github tag run;

```sh
npm run release <repo_version>
```

Where repo_version is in the form `v26.0.1-5` (`{{bbc_spec_version}}-{{monorepo_testpack_version}}`)

> [!CAUTION]
> Please contact Barn Owls before doing a versioned release.

This will automatically bump the tagged version number and push it to github if the script is successful. To make a release:

1. Make changes on a branch.
1. Test changes locally (e.g. `npm run dev`)
1. Review and merge PR
1. Check [the current repo version](./package.json) on `main`
1. Update [the specification version or repo release](#versioning) as appropriate.
1. Run `npm run release <repo_version>` on `main`.
1. Check the changes are available under the new version e.g. `/act/test/monorepo/{{new_version}}/{{path_to_test}}` (the version number includes a v e.g. v1.2.3-4)

## Publish to partners

Use `list-tests` to print an edit of the "monorepo" test pack. This script will:

- remove any monorepo tests not found locally
- add any monorepo tests not found in the pack
- updates the version of any monorepo tests with changes

```sh
npm run list-tests
```

You can use `compile-test-pack` to print this kind of edit for _any_ published test pack:

```sh
# print an edit of the "approved" test pack with all changed from a version
node ./scripts/compile-test-pack.js --pack approved --version <repo_version> --format object
```

You can also use `compile-test-pack` to print an edit of a local file. This is useful when you're drafting a new test pack.

```sh
# print an edit of a local test pack '2028_spec_streamlined_runtime_2029.1.json'
node ./scripts/compile-test-pack --pack "file://$(realpath ./2028_spec_streamlined_runtime_2029.1.json)"

# write all playback tests a file
node ./scripts/compile-test-pack --pack "file://$(realpath ./mse_all.base.json)" ./src/web-apis/audio ./src/web-apis/video > mse_all.json
```

You can see all the options by running the help command (`-h`):

```sh
# see options
node ./scripts/compile-test-pack.js --help
```
