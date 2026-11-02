import { chromium } from 'playwright'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const source = pathToFileURL(resolve(here, 'resume.html')).href
const output = resolve(here, '../../public/resume.pdf')

const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto(source, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.pdf({ path: output, format: 'Letter', printBackground: true, preferCSSPageSize: true })
await browser.close()

console.log(`Wrote ${output}`)
