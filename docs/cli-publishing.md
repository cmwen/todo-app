# CLI Publishing Setup

This document explains how to set up automated publishing of the CLI package to npm using GitHub Actions.

## Prerequisites

1. **npm Account**: You need an npm account with publishing permissions
2. **npm Token**: Create an automation token on npm for CI/CD
3. **GitHub Repository**: Your code should be in a GitHub repository

## Setup Instructions

### 1. Create npm Token

1. Go to [npm](https://www.npmjs.com) and log in
2. Click on your profile → "Access Tokens"
3. Click "Generate New Token" → "Automation"
4. Copy the token (starts with `npm_`)

### 2. Add GitHub Secret

1. Go to your GitHub repository
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Name: `NPM_TOKEN`
5. Value: Your npm token from step 1

### 3. Publishing Methods

#### Method A: Automatic (on Git Tag)

Push a git tag with the format `cli-v*`:

```bash
# Example: Release version 1.0.0
git tag cli-v1.0.0
git push origin cli-v1.0.0
```

Or use the helper script:

```bash
./scripts/release-cli.sh 1.0.0
```

#### Method B: Manual Trigger

1. Go to GitHub Actions in your repository
2. Click "Publish CLI to npm" workflow
3. Click "Run workflow"
4. Enter the version (e.g., "1.0.0" or "patch")
5. Click "Run workflow"

## What the Workflow Does

1. **Builds Dependencies**: Compiles shared packages
2. **Updates Version**: Sets the package version
3. **Removes Workspace Dependencies**: Replaces workspace deps with public ones
4. **Tests Installation**: Verifies the package can be installed
5. **Publishes to npm**: Publishes under `@cmwen/todo-app`
6. **Creates GitHub Release**: Creates a release with installation instructions

## After Publishing

Users can install your CLI globally:

```bash
npm install -g @cmwen/todo-app
```

And use it:

```bash
todo-app --help
```

## Troubleshooting

- **Permission Denied**: Check npm token has automation permissions
- **Package Already Exists**: Increment version number
- **Build Fails**: Ensure all dependencies are properly installed
- **Workspace Dependencies**: The workflow automatically handles these

## Version Management

The CLI package follows semantic versioning:
- **Major** (1.0.0): Breaking changes
- **Minor** (0.1.0): New features
- **Patch** (0.0.1): Bug fixes
