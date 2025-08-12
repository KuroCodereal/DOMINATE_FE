# Vercel Deployment Instructions

## 1. Environment Variables
If your project uses environment variables, add them in the Vercel dashboard under Project Settings > Environment Variables. You can also use `.env.local` for local development.

## 2. Build & Output Settings
- **Framework Preset:** Next.js
- **Build Command:** `next build`
- **Output Directory:** `.next`
- **Install Command:** `npm install` or `yarn install`

## 3. File Structure
- Make sure your `next.config.ts` is at the root.
- All source code is under `src/`.
- Static assets are in `public/`.

## 4. Vercel Configuration
- The `vercel.json` file is already created for custom routing and build settings.

## 5. Deploy
- Push your code to GitHub/GitLab/Bitbucket and import the repo in Vercel.
- Or use the Vercel CLI:
  ```sh
  npm i -g vercel
  vercel
  ```

## 6. Notes
- If you use custom server middleware, ensure it is compatible with Vercel Edge Functions or API routes.
- For static files, use the `public/` directory.

---
For more details, see: https://vercel.com/docs/deploy-projects
