// Renders every picture the README and the website use, straight from the plugin's code, so the art can
// never drift from what the plugin actually draws.   npm run art
//
// Output:
//   assets/biomes/<id>.svg                 animated scene per biome (README)
//   assets/trailer.svg                     the trailer (README)
//   docs/biomes/<id>.svg, <id>-still.svg   scenes for the site, plus the reduce-motion stills
//   docs/mobs/<name>.svg                   one portrait per mob
//   docs/trailer.svg                       the trailer again, for the site
//   docs/icon.svg, plus icon.png in docs/ and the plugin (only if Playwright is installed)

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { BIOMES } from '../plugins/overworld/hooks/biomes.ts'
import { MOBS, portrait } from '../plugins/overworld/hooks/mobs.ts'
import { trailer } from './trailer.mjs'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const write = (file, text) => {
  const full = path.join(root, file)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, text)
  console.log(`  wrote ${file} (${(text.length / 1024).toFixed(1)} KB)`)
}

for (const biome of BIOMES) {
  const scene = biome.draw(false)
  write(`assets/biomes/${biome.id}.svg`, scene)
  write(`docs/biomes/${biome.id}.svg`, scene)
  write(`docs/biomes/${biome.id}-still.svg`, biome.draw(true))
}

for (const name of Object.keys(MOBS)) write(`docs/mobs/${name}.svg`, portrait(name))

const cut = trailer()
write('assets/trailer.svg', cut)
write('docs/trailer.svg', cut)

// The plugin directory wants a PNG icon. That takes a headless browser, so it's optional: no Playwright,
// no PNG, and the rest still renders.
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" shape-rendering="crispEdges"><rect width="64" height="64" rx="12" fill="#1c1428"/><rect x="42" y="10" width="10" height="10" fill="#fbe8f0"/><rect x="44" y="12" width="2" height="2" fill="#f0d0de"/><rect x="12" y="18" width="2" height="2" fill="#f4a9c4"/><rect x="22" y="9" width="2" height="2" fill="#f4a9c4"/><rect y="48" width="64" height="16" fill="#2a1d18"/><rect y="48" width="64" height="4" fill="#4f8a3a"/><g transform="translate(12 8) scale(2.5)">${portrait('fox').replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g></svg>`
write('docs/icon.svg', iconSvg)
try {
  const { chromium } = await import('playwright')
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 512, height: 512 } })
  await page.setContent(`<body style="margin:0;background:transparent">${iconSvg.replace('<svg ', '<svg width="512" height="512" ')}</body>`)
  const png = await page.screenshot({ omitBackground: true })
  fs.writeFileSync(path.join(root, 'plugins/overworld/.claude-plugin/icon.png'), png)
  fs.writeFileSync(path.join(root, 'docs/icon.png'), png)
  console.log('  wrote the icon PNGs')
  await browser.close()
} catch {
  console.log('  icon.png skipped (Playwright not installed); icon.svg is up to date')
}
