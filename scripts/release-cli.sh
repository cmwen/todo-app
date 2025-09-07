#!/bin/bash

# Script to release the CLI package
# Usage: ./scripts/release-cli.sh <version>
# Example: ./scripts/release-cli.sh 1.0.0

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <version>"
    echo "Example: $0 1.0.0"
    exit 1
fi

VERSION=$1
TAG="cli-v$VERSION"

echo "🚀 Releasing CLI version $VERSION"

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ You must be on the main branch to release"
    exit 1
fi

# Check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Working directory is not clean. Please commit your changes first."
    exit 1
fi

# Update package version
echo "📝 Updating package.json version to $VERSION"
cd packages/cli
npm version $VERSION --no-git-tag-version
cd ../..

# Commit version change
git add packages/cli/package.json
git commit -m "chore(cli): bump version to $VERSION"

# Create and push tag
echo "🏷️  Creating tag $TAG"
git tag $TAG
git push origin main
git push origin $TAG

echo "✅ Release initiated! Check GitHub Actions for progress."
echo "📦 Once published, install with: npm install -g @cmwen/todo-app@$VERSION"
