# Tapestry Associates — Yacht Owner Representation

Marketing website and PDF brochure for [Tapestry Associates](https://www.tallc.com), an independent yacht owner representation firm.

## Local development

```bash
npm install
npm run dev
```

Opens a local server at `http://localhost:3000` serving the `public/` directory.

## Deployment

The site is deployed on Vercel. The `public/` directory is the output root (`vercel.json`). Pushing to `main` triggers an automatic deploy.

## Generating the PDF brochure

The brochure (`Tapestry-Yacht-Owner-Representation.pdf`) is rendered from `brochure.html` using Puppeteer and ImageMagick:

```bash
node render.mjs
```

**Requirements:** Node.js, Puppeteer, and ImageMagick (`magick` in PATH).

The script captures each `.page` element at 3× scale (print-quality 288 DPI) and assembles them into a single PDF.
