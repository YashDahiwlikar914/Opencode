#!/usr/bin/env bash
set -euo pipefail

REPO="https://github.com/YashDahiwlikar914/Opencode.git"
BRANCH="dev"
INSTALL_DIR="${OPENCODE_INSTALL_DIR:-$HOME/.opencode/bin}"
SRC_DIR="${OPENCODE_FORK_DIR:-}"

usage() {
  cat <<EOF
Fork installer. Clones the fork, builds from source, installs to ~/.opencode/bin.

Usage:
  install.sh [options]

Options:
  -h, --help            Show this help
  -b, --branch <name>   Git branch to build (default: dev)
  -d, --dir <path>      Use existing checkout at path instead of fresh clone
      --no-build        Update checkout only, skip bun install and build
      --no-modify-path  Do not suggest shell PATH changes

Env:
  OPENCODE_INSTALL_DIR  Install location (default: \$HOME/.opencode/bin)
  OPENCODE_FORK_DIR     Same as --dir

Examples:
  curl -fsSL https://raw.githubusercontent.com/YashDahiwlikar914/Opencode/dev/install.sh | bash
  ./install.sh --branch dev
  ./install.sh --dir \$HOME/Projects/Opencode
EOF
}

NO_BUILD=false
NO_MODIFY_PATH=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help) usage; exit 0 ;;
    -b|--branch) BRANCH="${2:?--branch needs a value}"; shift 2 ;;
    -d|--dir) SRC_DIR="${2:?--dir needs a value}"; shift 2 ;;
    --no-build) NO_BUILD=true; shift ;;
    --no-modify-path) NO_MODIFY_PATH=true; shift ;;
    *) echo "Unknown option $1" >&2; usage >&2; exit 1 ;;
  esac
done

need() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Error: $1 is required but not installed." >&2
    exit 1
  }
}

need git
need curl
need bun

CLEANUP_SRC=false
if [[ -z "$SRC_DIR" ]]; then
  SRC_DIR="$(mktemp -d -t opencode-fork-XXXXXX)"
  CLEANUP_SRC=true
fi

cleanup() {
  if [[ "$CLEANUP_SRC" == "true" ]]; then
    rm -rf "$SRC_DIR"
  fi
}
trap cleanup EXIT

if [[ -d "$SRC_DIR/.git" ]]; then
  echo "Using existing checkout at $SRC_DIR"
  git -C "$SRC_DIR" fetch origin "$BRANCH" --depth 1
  git -C "$SRC_DIR" checkout "$BRANCH"
  git -C "$SRC_DIR" pull --ff-only origin "$BRANCH" || true
else
  if [[ "$CLEANUP_SRC" == "true" ]]; then
    echo "Cloning $REPO branch $BRANCH"
    git clone --branch "$BRANCH" --depth 1 "$REPO" "$SRC_DIR"
  else
    echo "Cloning $REPO branch $BRANCH into $SRC_DIR"
    git clone --branch "$BRANCH" --depth 1 "$REPO" "$SRC_DIR"
  fi
fi

if [[ "$NO_BUILD" == "true" ]]; then
  echo "Checkout ready at $SRC_DIR. Build skipped."
  exit 0
fi

echo "Installing dependencies with bun"
bun install --cwd "$SRC_DIR"

echo "Building fork binary for this machine"
(
  cd "$SRC_DIR/packages/opencode"
  bun run script/build.ts --single
)

BUILT=""
for candidate in "$SRC_DIR"/packages/opencode/dist/opencode-*/bin/opencode; do
  if [[ -f "$candidate" ]]; then
    BUILT="$candidate"
    break
  fi
done

if [[ -z "$BUILT" ]]; then
  echo "Error: build finished but no binary found under packages/opencode/dist." >&2
  exit 1
fi

mkdir -p "$INSTALL_DIR"

if [[ ! -e "$INSTALL_DIR/opencode-official" ]] && [[ -e "$INSTALL_DIR/opencode" ]] && [[ ! -L "$INSTALL_DIR/opencode" ]]; then
  echo "Backing up current binary to opencode-official"
  cp "$INSTALL_DIR/opencode" "$INSTALL_DIR/opencode-official"
fi

echo "Installing fork binary"
cp "$BUILT" "$INSTALL_DIR/opencode-fork.new"
chmod +x "$INSTALL_DIR/opencode-fork.new"
mv -f "$INSTALL_DIR/opencode-fork.new" "$INSTALL_DIR/opencode-fork"
ln -sfn opencode-fork "$INSTALL_DIR/opencode"

echo "Installed version:"
"$INSTALL_DIR/opencode" --version

if [[ "$NO_MODIFY_PATH" == "false" ]]; then
  case ":$PATH:" in
    *":$INSTALL_DIR:"*) ;;
    *)
      echo ""
      echo "Add the install dir to your PATH so the fork wins over other copies:"
      echo "  export PATH=\"$INSTALL_DIR:\$PATH\""
      echo "Then restart your shell."
      ;;
  esac
fi
