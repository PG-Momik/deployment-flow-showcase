#!/usr/bin/env bash
set -euo pipefail

branch=${1:?release branch required}
sha=${2:?commit SHA required}
destination=${3:?destination required}

run_id=$(gh run list --workflow deploy.yml --branch "$branch" --limit 100 --json databaseId,headSha,conclusion | jq -r --arg sha "$sha" 'first(.[] | select(.headSha == $sha and .conclusion == "success") | .databaseId) // empty')
[[ -n "$run_id" ]] || { echo "No successful staging deployment for $branch at $sha"; exit 1; }
mkdir -p "$destination"
gh run download "$run_id" --name "build-staging-$sha" --dir "$destination"
[[ "$(cat "$destination/sha")" == "$sha" ]] || { echo 'Staged artifact SHA mismatch'; exit 1; }
