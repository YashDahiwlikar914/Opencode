#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

git fetch upstream dev

dirty=$(git status --porcelain)
if [ -n "$dirty" ]; then
  git stash push -u -m "update-fork: auto-stash"
fi

git rebase upstream/dev || {
  echo "Rebase conflicts. Resolve them, then: git rebase --continue"
  echo "Rerun this script afterward to build and install."
  exit 1
}

if [ -n "$dirty" ]; then
  git stash pop || {
    echo "Stash pop conflicts. Resolve them, then rerun this script to build and install."
    exit 1
  }
fi

(cd packages/opencode && bun run script/build.ts --single)

cp packages/opencode/dist/opencode-linux-x64/bin/opencode "$HOME/.opencode/bin/opencode-fork"
ln -sfn opencode-fork "$HOME/.opencode/bin/opencode"

"$HOME/.opencode/bin/opencode" --version
