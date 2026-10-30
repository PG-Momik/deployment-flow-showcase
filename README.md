# Deployment flow showcase

A small, self-contained GitHub Actions lab for the [PROJECT-0531 trunk-based flow](https://os.carepilot.com/product/projects/PROJECT-0531?doc=tdd-001). It builds a static page and records deployments in GitHub Environments. Each job publishes a downloadable artifact. There is no hosting service or long-running app.

## What to check

- When a change reaches `main`, I should see a **dev** deployment with a built artifact.
- When I click Cut release branch, I should see the next `release/YYYY.MM.N`, a completed staging build, and a staging **deploy** job waiting for my approval.
- When I click Ship to production with one open release branch, I should see its matching version tag, a GitHub Release, and a **production** deployment using the exact staged artifact, with no production build.
- When staging has not successfully deployed the current branch tip, shipping should stop before tagging.
- When there is no open release branch or more than one, shipping should stop without choosing a branch.

## Try it on GitHub

1. Create an empty repository in your personal account, then push this repo's `main` branch. In repository settings, give Actions read and write permissions.
2. Create environments named `dev`, `staging`, `production`, `cut-release-branch`, and `ship-to-production`. In the `staging` environment's protection rules, add your account as a **required reviewer** and allow self-review if GitHub offers that setting. Without a required reviewer, GitHub starts the deploy job immediately. Add reviewers to the cut and ship approval environments if your GitHub plan allows it. Limit staging to `release/*` and production to `v*` tags when available.
3. In **Actions → Cut release branch → Run workflow**, leave **Use workflow from** on `main` and click **Run workflow**. The job picks the next unused monthly version, pushes its branch, and explicitly starts **Build and deploy** because a workflow-token push does not trigger another workflow. If a release branch is already open, this button keeps its commit unchanged and starts staging again. The staging `build` job uploads `build-staging-<commit SHA>` and completes. On that run page, click **Review deployments** to approve the waiting `deploy` job.
4. After the staging run passes, open **Actions → Ship to production → Run workflow**, leave **Use workflow from** on `main`, and click **Run workflow**. The job finds the one open release branch, checks that staging succeeded at its tip, creates the matching version tag, starts the production run, and waits for it. The production build job copies the staging artifact without rebuilding and the production deploy job saves `deployed-production-<same commit SHA>`. The ship job then creates a GitHub Release and deletes the release branch.
5. Compare the `sha` and `index.html` files in the staging build and production deployed artifacts. They should be identical. The **Build and deploy** run summaries show the environment and commit.

Run `npm test`, `npm run lint`, and `npm run build` locally. The page in `dist/` is the same deployable content the workflows upload.

## Squash merge drill

Create two PRs from separate branches based on `main`. Merge each with **Squash and merge**, one after the other. Each PR's commits become one commit on `main`, and neither merge creates a merge commit.

## Safety and scope

This lab uses one permanent branch, `main`. Use short feature branches and squash PRs into it. The cut and ship workflows request GitHub Environment approval, but the workflow files cannot configure reviewers or protect refs. Protect `main` with PR review, restrict creation of `release/*` and `v*` to the intended people and Actions, and prevent version tags from moving or being deleted in repository rulesets. Without those settings, a person with write access could push a version tag directly and trigger production.

The production job checks that the tag matches the live release branch tip and that a successful staging artifact for that commit exists. The artifact retention is 30 days. The release branch stays available for retries until production and GitHub Release creation succeed. Cut reuses the sole open release branch; both buttons refuse to guess when branch selection is ambiguous. This showcase omits hotfixes, rollbacks, and cherry-pick policy from the full TDD.
