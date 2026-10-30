# Deployment flow showcase

A small, self-contained GitHub Actions lab for the [PROJECT-0531 trunk-based flow](https://os.carepilot.com/product/projects/PROJECT-0531?doc=tdd-001). It builds a static page and records deployments in GitHub Environments. Each job publishes a downloadable artifact. There is no hosting service or long-running app.

## What to check

- When a change reaches `main`, I should see a **dev** deployment with a built artifact.
- When I cut `release/YYYY.MM.N`, I should see a **staging** deployment at that branch tip.
- When I ship that branch, I should see `vYYYY.MM.N` and a **production** deployment using the exact staged artifact, with no production build.
- When staging has not successfully deployed the current branch tip, shipping should stop before tagging.

## Try it on GitHub

1. Create an empty repository in your personal account, then push this repo's `main` branch. In repository settings, give Actions read and write permissions.
2. Create environments named `dev`, `staging`, `production`, `cut-release-branch`, and `ship-to-production`. Add reviewers to the two approval environments if your GitHub plan allows it. Limit the staging environment to `release/*` and production to `v*` tags when available.
3. In **Actions → Cut release branch → Run workflow**, enter a new version such as `2026.11.1`. The job pushes the branch and explicitly starts **Build and deploy** because a workflow-token push does not trigger another workflow. The staging run uploads `build-staging-<commit SHA>`.
4. In **Actions → Ship to production → Run workflow**, enter `release/2026.11.1`. The job checks that a successful staging run exists for the branch tip, creates `v2026.11.1`, starts the production run, and waits for it. The production run downloads the staging artifact and uploads it as `build-production-<same commit SHA>`.
5. Compare the `sha` and `index.html` files in the staging and production artifacts. They should be identical. The **Build and deploy** run summaries show the environment and commit.

Run `npm test`, `npm run lint`, and `npm run build` locally. The page in `dist/` is the same deployable content the workflows upload.

## Safety and scope

This lab uses one permanent branch, `main`. Use short feature branches and squash PRs into it. The cut and ship workflows request GitHub Environment approval, but the workflow files cannot configure reviewers or protect refs. Protect `main` with PR review, restrict creation of `release/*` and `v*` to the intended people and Actions, and prevent version tags from moving or being deleted in repository rulesets. Without those settings, a person with write access could push a version tag directly and trigger production.

The production job checks that the tag matches the live release branch tip and that a successful staging artifact for that commit exists. The artifact retention is 30 days. Keep the release branch until the production run succeeds so the tag check and retry path remain available. This showcase leaves cleanup manual and uses an entered version instead of automatic numbering. It omits hotfixes, rollbacks, release notes, and cherry-pick policy from the full TDD.
