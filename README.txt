ARIX repair files
=================

These files are designed to fit your existing ARIX index.html and root style.css.

FILES IN THIS ZIP
- assets/js/stories.js
- assets/js/app.js
- service-worker.js

IMPORTANT FOLDER PATHS
Your GitHub repository must contain:
  index.html
  style.css
  manifest.json
  service-worker.js
  assets/js/stories.js
  assets/js/app.js

Do NOT upload these into assets/assets/js.
Do NOT replace index.html or style.css with this ZIP; it contains only repair files.

HOW TO ADD ON GITHUB USING A PHONE
1. Open your repository jaycodes-source/arix on GitHub.
2. Open the assets folder, then open js.
3. Use Add file > Create new file if needed, and enter the exact path assets/js/stories.js from the repository root. Paste the contents of stories.js and commit.
4. Repeat for assets/js/app.js.
5. At repository root, replace service-worker.js with the version in this ZIP and commit.
6. Wait for GitHub Pages to redeploy, then reload the website. If an old version remains, clear site data/cache for the website or test in a private tab.

The included story list is sample demo content. Story pages are previews; real uploaded comic pages and backend features are not included. User bookmarks/history are saved locally in the browser, not synced to an account.
