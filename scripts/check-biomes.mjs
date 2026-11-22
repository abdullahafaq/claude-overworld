// Biome checks. CI runs these on every push, and `npm run check:biomes` runs them locally.
//
// For each biome:
//   contrast   primary text ≥ 13:1 on all four surfaces; secondary, muted and the accent ≥ 6:1
//   painting   makeColors (Claude Code's own) mustn't report anything the desktop app would refuse
//   scene      ≤ 128 KB, vector only (no <image>, <script>, links, fonts or remote URLs), plain comments
//   motion     no animation cycle shorter than 1s, and the still version must really be still

import { PALETTES } from '../plugins/overworld/hooks/palettes.ts'
import { BIOMES } from '../plugins/overworld/hooks/biomes.ts'
import { makeColors } from '../plugins/overworld/hooks/make-colors.js'

const MAX_SCENE = 131_072
const MIN_MAIN = 13
const MIN_SOFT = 6
const MIN_CYCLE_S = 1

let failures = 0
const fail = (what) => { failures += 1; console.log(`  ✘ ${what}`) }
const pass = (what) => console.log(`  ✔ ${what}`)

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

for (const biome of BIOMES) {
  console.log(`\n${biome.title}`)
  const palette = PALETTES[biome.id]
  const mode = palette.only
  const a = palette[mode].gray.anchors
  const surfaces = ['surface-0', 'surface-1', 'surface-2', 'surface-3'].map(k => a[k])

  const worst = (colour) => Math.min(...surfaces.map(s => contrast(colour, s)))
  const main = worst(a['text-primary'])
  const soft = Math.min(worst(a['text-secondary']), worst(a['text-muted']))
  const accent = contrast(palette.roles.accent, a['surface-0'])
  main >= MIN_MAIN ? pass(`main text ${main.toFixed(1)}:1`) : fail(`main text only ${main.toFixed(1)}:1 (needs ${MIN_MAIN}:1)`)
  soft >= MIN_SOFT ? pass(`softer text ${soft.toFixed(1)}:1`) : fail(`softer text only ${soft.toFixed(1)}:1 (needs ${MIN_SOFT}:1)`)
  accent >= MIN_SOFT ? pass(`accent ${accent.toFixed(1)}:1`) : fail(`accent only ${accent.toFixed(1)}:1 (needs ${MIN_SOFT}:1)`)

  const { problems } = makeColors(palette)
  const unpainted = problems.filter(line => line.startsWith("Desktop won't paint"))
  unpainted.length === 0 ? pass('Claude Code will paint it') : unpainted.forEach(line => fail(line))

  const scene = biome.draw(false)
  const still = biome.draw(true)
  scene.length <= MAX_SCENE ? pass(`scene ${(scene.length / 1024).toFixed(1)} KB`) : fail(`scene is ${scene.length} chars (limit ${MAX_SCENE})`)

  const unsafe = [/<image\b/i, /<script\b/i, /<foreignObject\b/i, /\bhref\b/i, /url\((?!#)/i, /@import/i, /@font-face/i, /<!\[CDATA\[/i, /\bon[a-z]+=/i, /https?:\/\/(?!www\.w3\.org\/2000\/svg)/i]
  const found = unsafe.filter(re => re.test(scene))
  found.length === 0 ? pass('pure vector, nothing loaded from outside') : found.forEach(re => fail(`scene contains ${re}`))

  const comments = [...scene.matchAll(/<!--([\s\S]*?)-->/g), ...scene.matchAll(/\/\*([\s\S]*?)\*\//g)].map(m => m[1])
  const badComment = comments.find(c => /[<&]|--|\w\(|@\w/.test(c))
  badComment === undefined ? pass('comments are plain') : fail(`a comment Claude Code would trip on: ${badComment}`)

  const cycles = [...scene.matchAll(/animation(?:-duration)?:\s*(?:ow-[\w-]+\s+)?([\d.]+)s/g)].map(m => Number(m[1]))
  const fastest = Math.min(...cycles)
  fastest >= MIN_CYCLE_S ? pass(`fastest animation cycle ${fastest}s`) : fail(`an animation cycles every ${fastest}s (min ${MIN_CYCLE_S}s)`)

  const holdsStill = /animation:none!important\}$/.test(still.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? '')
  holdsStill ? pass('still version holds still') : fail('the still version can still move')
}

console.log(failures ? `\n${failures} check${failures === 1 ? '' : 's'} failed.` : `\nAll ${BIOMES.length} biomes pass.`)
process.exit(failures ? 1 : 0)
