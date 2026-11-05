# GitHub Contribution Dashboard

This folder contains a GitHub Actions workflow that creates a custom Tokyo Night-style contribution dashboard SVG from GitHub's contribution calendar.

## Setup

1. Copy `.github/workflows/update-contribution-dashboard.yml`, `scripts/generate-dashboard.mjs`, and `assets/` into the root of your GitHub profile README repository.
2. Create a GitHub personal access token with **read:user** permission. For a fine-grained token, grant access to your account's user profile read permission if offered; a classic token with `read:user` is the straightforward option.
3. In your repository, open **Settings → Secrets and variables → Actions → New repository secret**. Name it `GH_TOKEN` and paste the token.
4. In **Settings → Actions → General → Workflow permissions**, enable **Read and write permissions**.
5. Run **Actions → Update contribution dashboard → Run workflow** once.
6. Add this to your README where the graph should appear:

   `![Contribution Activity](./assets/contribution-dashboard.svg)`

The workflow refreshes the SVG daily. The dashboard's counts are real values fetched from GitHub; the sample design image shown in chat is only a visual mockup.

If your GitHub username changes, update `GITHUB_USERNAME` in the workflow.
