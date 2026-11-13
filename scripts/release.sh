#!/usr/bin/env bash
set -euo pipefail

TAG="${1:-v.0.0.1}"

if [[ ! "$TAG" =~ ^v\.?[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Usage: ./scripts/release.sh v.0.0.1"
  exit 1
fi

echo "Tagging release $TAG..."
git tag -a "$TAG" -m "Release $TAG"
git push origin "$TAG"
echo "Pushed tag $TAG. GitHub Actions will build and publish the Android 6.0+ APK release."
