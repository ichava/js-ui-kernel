# Release

Tagging a release, and moving consumers to it.

## Versioning

SemVer on 0.x. A breaking change bumps the minor and everything else bumps the patch; Conventional
Commit subjects decide which. The minor moves in lockstep with the other coupled Ichava packages
(core, the packs, icon-browser, the scaffolder, react-icon-browser and react-landingpage), so
`^0.1` means the 0.1 line of the whole family.

## Cutting a release

release-please opens the release pull request; see `.github/workflows/release-please.yml`.

1. Every pull request that changes behaviour adds to the one `## [Unreleased]` section of
   `CHANGELOG.md`, and uses a Conventional Commit subject.
2. Run *Release Please* from the Actions tab (it also runs every Monday). It opens or refreshes one
   release pull request that bumps `package.json` and `.release-please-manifest.json`, plus the `#vX.Y.Z` install lines in
   `README.md` and `docs/installation.md` (each carries an `x-release-please-version` marker), and
   closes `[Unreleased]` as `## [X.Y.Z] - date` on that branch. It fails when `[Unreleased]` is empty.
3. Merge the release pull request once CI is green. That run tags `vX.Y.Z` and creates the release;
   the tag starts `release.yml`, which publishes the changelog section as the body.

Never edit the release pull request by hand: release-please rebuilds its branch and drops anything
it did not write. Change the notes on `main` instead. If a tag ever starts nothing, run
`gh workflow run release.yml --ref vX.Y.Z`; it refuses any ref that is not a release tag.

`v0.1.1` was once tagged with `package.json` still at `0.1.0`; release-please moves the version
field in the same pull request, so that cannot recur.

## Moving consumers

Consumers pin a tag in their git dependency. After a release, update the tag in each consumer's
`package.json` in one pull request per repository. A release that changes a file under `config/`
also needs the new copy in each consumer, or its drift check stays red.

---

[← Docs index](../README.md#documentation)
