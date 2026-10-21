# ARIX premium frontend starter

This is a clean, responsive **frontend starter** for the ARIX comic/novel project. It is designed for phones, tablets, laptops and desktop screens.

## Files
- `index.html` — page structure and views
- `style.css` — responsive dark premium styling and intro animation
- `assets/js/stories.js` — sample catalogue and genres
- `assets/js/app.js` — navigation, search, demo bookmarks, local reading history, settings
- `manifest.json` and `service-worker.js` — basic installability/offline app shell
- `assets/icons/arix-mark.svg` — temporary logo image used by the intro and brand. Replace this file with your new logo image (or update the image path in `index.html`). The intro shows only the logo: it appears, stays briefly, then disappears.

## Deploy to GitHub Pages
Upload the contents of this folder to the root of your repository, preserving the folders. Keep `index.html`, `style.css`, `manifest.json`, and `service-worker.js` at the repository root. Keep `assets/js/` and `assets/icons/` as folders. Commit and push, then open the GitHub Pages URL. Use HTTPS for service worker/PWA features.

## Important current limitations
- Stories are sample data; cover designs are generated with CSS, not uploaded story artwork.
- No real chapter content is included yet. The reader shows an honest preview state until chapters are added.
- Bookmarks, reading history, and display settings are stored in the current browser only.
- Supabase is **not connected yet**. Authentication, secure admin permissions, story uploads, shared data, and cross-device sync must be implemented in the backend stage.
- The service worker caches the app shell. It does not automatically make future remote story images or Supabase data available offline.

## Before connecting Supabase
1. Verify navigation, responsive layouts, and search on your devices.
2. Create Supabase tables/storage buckets and Row Level Security policies.
3. Use Supabase Auth for accounts; never place a service-role key in frontend code.
4. Add real story/chapter data and secure admin-only write policies.
5. Test deployment and browser console errors after each change.


## Uploading without uploading a ZIP
GitHub does not deploy a ZIP as the website. Extract the ZIP on your device, then upload the extracted files/folders to the repository while preserving their paths. If your phone's GitHub interface cannot upload folders, create/upload each file at its exact path or use GitHub Desktop on a computer.
