# Token Tracker (Farcaster Mini App)

This project is a Next.js mini-app for Farcaster that tracks tokens and sends price alerts.

Quick start (development):

```bash
# install
npm install

# development server
npm run dev
# open http://localhost:3000/?farcaster_mock=1 to enable local mock SDK
```

Build & run production locally:

```bash
npm run build
npm run start
# open http://localhost:3000
```

Windows (CMD) - recommended when using PowerShell with restrictive execution policy:

```cmd
npm.cmd ci
npm.cmd run build
npm.cmd run start
# open http://localhost:3000
```

Deploy to Vercel

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Set Environment Variables (if you need to enable the mock in a preview):
   - NEXT_PUBLIC_FARCASTER_MOCK=1 (optional)
4. Vercel will run `npm run build` automatically for Next.js apps.

Push & deploy (example):

```bash
# initialize git repository if needed
git init
git add .
git commit -m "Initial commit: prepare for deploy"
# add your remote and push
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

CI

A GitHub Actions workflow is included at `.github/workflows/ci.yml` to run `npm install` and `npm run build` on push/PR.

Notes

- The Farcaster runtime integration is handled by `lib/farcaster-sdk.ts` and `components/farcaster-init.tsx`.
- Local testing of Farcaster features can be enabled with `?farcaster_mock=1` or by setting `NEXT_PUBLIC_FARCASTER_MOCK=1` in your environment.

If you want, I can also push the repository to GitHub for you and create the Vercel project.