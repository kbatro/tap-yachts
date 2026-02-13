import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function render() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 3x scale for print-quality rendering (3168x2448 per page)
  await page.setViewport({ width: 1056, height: 816, deviceScaleFactor: 3 });

  const htmlPath = path.join(__dirname, 'brochure.html');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 1000));

  // Screenshot each page as high-quality JPEG — flat raster, instant PDF rendering
  const pageElements = await page.$$('.page');
  const pageImages = [];

  for (let i = 0; i < pageElements.length; i++) {
    const imgPath = path.join(__dirname, `_page_${i + 1}.jpg`);
    const previewPath = `/tmp/tapestry_preview_${i + 1}.jpg`;

    await pageElements[i].screenshot({ path: imgPath, type: 'jpeg', quality: 95 });
    console.log(`Page ${i + 1} captured`);
    pageImages.push(imgPath);

    // Lower-quality preview copy
    await pageElements[i].screenshot({ path: previewPath, type: 'jpeg', quality: 90 });
  }

  await browser.close();
  console.log('Screenshots saved to /tmp/');

  // Combine page images into a single PDF using ImageMagick
  // Each page is a single flat image — no compositing, loads instantly
  const outputPdf = path.join(__dirname, 'tapestry-v3.pdf');
  const imgArgs = pageImages.map(p => `"${p}"`).join(' ');
  execSync(
    `magick ${imgArgs} -density 288 -units PixelsPerInch "${outputPdf}"`,
    { stdio: 'inherit' }
  );

  // Clean up temp images
  pageImages.forEach(p => fs.unlinkSync(p));

  const sizeMB = (fs.statSync(outputPdf).size / 1024 / 1024).toFixed(1);
  console.log(`PDF generated: tapestry-v3.pdf (${sizeMB}MB)`);
}

render().catch(console.error);
