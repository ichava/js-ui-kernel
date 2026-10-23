# Release

Tagging a release, and moving consumers to it.

## Versioning

SemVer on 0.x. A breaking change bumps the minor and everything else bumps the patch; Conventional
Commit subjects decide which. The minor moves in lockstep with the other coupled Ichava packages
(core, the packs, icon-browser, the scaffolder, react-icon-browser and react-landingpage), so
`^0.1` means the 0.1 line of the whole family.

## Cutting a release

1. Move the `[Unreleased]` section of `CHANGELOG.md` under a `## [X.Y.Z]` heading. The release
   workflow publishes that section as the release body and refuses a tag without one.
2. Tag the merge commit on `main` as `vX.Y.Z` and push the tag.

## Moving consumers

Consumers pin a tag in their git dependency. After a release, update the tag in each consumer's
`package.json` in one pull request per repository. A release that changes a file under `config/`
also needs the new copy in each consumer, or its drift check stays red.

---

[← Docs index](../README.md#documentation)
