#!/usr/bin/env node
/* eslint-env node */
// Renders the /resume page's print layout to public/resume.pdf so the download matches the site.
// Start the dev server first (npm run dev), then:
//   npm run resume:pdf [-- http://localhost:5173/resume]
import { chromium } from 'playwright'

const url = process.argv[2] || 'http://localhost:5173/resume'
const out = 'public/resume.pdf'

const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto(url, { waitUntil: 'load' })
await page.waitForSelector('.resume-sheet')
await page.evaluate(() => document.fonts.ready)
await page.emulateMedia({ media: 'print' })
await page.pdf({ path: out, format: 'Letter', preferCSSPageSize: true, printBackground: true })
await browser.close()

console.log(`Wrote ${out} from ${url}`)
