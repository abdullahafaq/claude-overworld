// The trailer: an animated SVG (README + site) cut from the real plugin art. One 52-second loop:
//
//   0.0s   "Generating world": a block progress bar, then the OVERWORLD logo placed block by block
//   4.6s   the app window. `/overworld <biome>` gets typed, a block wipe swaps the world, once per biome
//   32.6s  the Party pane slides in and agents spawn as mobs; the test runner's creeper goes boom
//   44.0s  a hotbar of every biome and the install line on a sign
//
// Transitions are block wipes and stepped moves, slow enough to never flicker (every cycle 1s or more).
// Reduce motion shows the last frame only.

import { BIOMES } from '../plugins/overworld/hooks/biomes.ts'
import { portrait } from '../plugins/overworld/hooks/mobs.ts'
import { PALETTES } from '../plugins/overworld/hooks/palettes.ts'

const W = 1600
const H = 900
const T = 52
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,system-ui,sans-serif"
const MONO = "ui-monospace,'SF Mono',Menlo,Consolas,monospace"
const SKY_TOP = '#0d1330'
const SKY_LOW = '#1a1838'
const GRASS = '#5aa83a'
const DIRT = '#6b4a2e'
const PLANK = '#9a6b3f'
const CREAM = '#fff4dc'

/** Each biome's colour for a dark stage. Meadow's real accent is a deep green for its light theme. */
const glow = id => (id === 'meadow' ? '#8fd08a' : PALETTES[id].roles.accent)

const pct = s => ((s / T) * 100).toFixed(3)
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const rect = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${extra ? ' ' + extra : ''}/>`
const text = (x, y, size, fill, words, extra = '') => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}"${extra ? ' ' + extra : ''}>${esc(words)}</text>`
const mini = (mob, size, x, y, faded = false) => `<svg x="${x}" y="${y}" width="${size}" height="${size}">${portrait(mob, faded).replace(/^<svg[^>]*>/, `<svg viewBox="0 0 16 16" shape-rendering="crispEdges"${faded ? ' opacity="0.45"' : ''}>`)}</svg>`

let css = ''
let n = 0
const id = prefix => `tr${prefix}${n++}`

/** Shown from `from` to `to` seconds; `cut` makes it switch instantly (the block wipe hides the cut). */
function shown(from, to, cut = false) {
  const c = id('s')
  const f = cut ? 0.02 : 0.5
  css += `.${c}{opacity:0;animation:${c} ${T}s linear infinite}@keyframes ${c}{0%,${pct(Math.max(0, from - f))}%{opacity:0}${pct(from)}%,${pct(to - f)}%{opacity:1}${pct(to)}%,100%{opacity:0}}`
  return c
}
/** Steps up from below into place, holds, then leaves. */
function stepIn(from, to, dy = 24) {
  const c = id('u')
  css += `.${c}{opacity:0;animation:${c} ${T}s steps(${Math.round(T * 8)},end) infinite}@keyframes ${c}{0%,${pct(from)}%{opacity:0;transform:translateY(${dy}px)}${pct(from + 0.5)}%,${pct(to - 0.4)}%{opacity:1;transform:translateY(0)}${pct(to)}%,100%{opacity:0;transform:translateY(0)}}`
  return c
}
/** Slides in from the right, holds, then leaves. */
function slideIn(from, to, dx) {
  const c = id('l')
  css += `.${c}{animation:${c} ${T}s steps(${Math.round(T * 8)},end) infinite}@keyframes ${c}{0%,${pct(from)}%{transform:translateX(${dx}px);opacity:0}${pct(from + 0.8)}%,${pct(to - 0.4)}%{transform:translateX(0);opacity:1}${pct(to)}%,100%{transform:translateX(0);opacity:0}}`
  return c
}
/** Grows a bar from the left to `share` of its width between `from` and `until`. */
function grow(from, until, share) {
  const c = id('g')
  css += `.${c}{transform-box:fill-box;transform-origin:left;animation:${c} ${T}s steps(${Math.round(T * 8)},end) infinite}@keyframes ${c}{0%,${pct(from)}%{transform:scaleX(0)}${pct(until)}%,100%{transform:scaleX(${share})}}`
  return c
}
/** Reveals typed text one character at a time by widening a clip. */
function typing(x, y, chars, charW, from, to) {
  const c = id('t')
  const full = chars * charW
  const dur = Math.min(1.2, chars * 0.07)
  css += `.${c}{transform-box:fill-box;transform-origin:left;animation:${c} ${T}s steps(${Math.round(T * 30)},end) infinite}@keyframes ${c}{0%,${pct(from)}%{transform:scaleX(0)}${pct(from + dur)}%,${pct(to)}%{transform:scaleX(1)}100%{transform:scaleX(1)}}`
  return { clip: `<clipPath id="${c}-clip"><rect class="${c}" x="${x}" y="${y - 24}" width="${full}" height="32"/></clipPath>`, ref: `url(#${c}-clip)` }
}

/** Scenes go into <defs> once each; every id inside gets the biome's name so they can share one file. */
function sceneSymbol(biome) {
  return biome.draw(false)
    .replace(/id="([^"]+)"/g, `id="${biome.id}-$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${biome.id}-$1)`)
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/ role="img" aria-label="[^"]*"/, '')
    .replace('<svg ', `<svg id="scene-${biome.id}" `)
}
const scene = (biome, x, y, w, h) => `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice"><use href="#scene-${biome.id}"/></svg>`

/** A wooden sign, the trailer's caption style. */
function sign(x, y, w, h, lines) {
  return rect(x, y, w, h, PLANK, 'stroke="#5e3f22" stroke-width="4"') + rect(x + 4, y + 4, w - 8, 4, '#b8854f') +
    lines.map(([words, size, extra], i) => `<text x="${x + 22}" y="${y + 40 + i * 30}" font-size="${size}" fill="${CREAM}"${extra ? ' ' + extra : ''}>${words}</text>`).join('')
}

// ---------------------------------------------------------------- the logo, block by block

const GLYPHS = {
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
}

/** The logo, placed row by row from the bottom up, like building it. */
function logo(x0, y0, cell, from, to) {
  const colours = [...BIOMES.map(b => glow(b.id)), CREAM]
  const rows = 7
  let out = ''
  for (let r = rows - 1; r >= 0; r -= 1) {
    const at = from + (rows - 1 - r) * 0.16
    const c = shown(at, to, true)
    let parts = ''
    'OVERWORLD'.split('').forEach((ch, i) => {
      let d = ''
      ;[...GLYPHS[ch][r]].forEach((px, x) => { if (px === '#') d += `M${x0 + i * cell * 6 + x * cell} ${y0 + r * cell}h${cell}v${cell}h-${cell}z` })
      if (d) parts += `<path d="${d}" fill="${colours[i]}"/><path d="${d}" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="2"/>`
    })
    out += `<g class="${c}">${parts}</g>`
  }
  return out
}

function ground(y) {
  let blocks = ''
  for (let x = 0; x < W; x += 32) blocks += rect(x, y + 16, 32, H - y - 16, (x / 32) % 2 ? DIRT : '#5e4128')
  return rect(0, y, W, 16, GRASS) + rect(0, y + 12, W, 4, '#468a2c') + blocks
}

function opening(from, to) {
  const bar = 640
  let blocks = ''
  for (let i = 0; i < 20; i += 1) blocks += `<g class="${shown(from + 0.15 + i * 0.07, from + 1.9, true)}">${rect(W / 2 - bar / 2 + 6 + i * 31.4, 466, 26, 20, GRASS)}</g>`
  const loading = `<g class="${shown(from, from + 2)}">${text(W / 2, 440, 22, CREAM, 'Generating world', `text-anchor="middle" font-family="${MONO}"`)}` +
    rect(W / 2 - bar / 2, 460, bar, 32, '#141824', 'stroke="#3c4256" stroke-width="3"') + blocks + '</g>'
  return `<g class="${shown(from, to, true)}">` + loading +
    logo(W / 2 - 432, 300, 16, from + 2.1, to) +
    `<g class="${stepIn(from + 3.2, to)}">${text(W / 2, 520, 30, '#d9d4f0', 'Your Claude Code chat, in ten pixel biomes.', 'text-anchor="middle"')}</g>` +
    '</g>'
}

// ---------------------------------------------------------------- the app window, biome by biome

const WIN = { x: 200, y: 40, w: 1200, h: 680 }
const BODY = { x: WIN.x, y: WIN.y + 36, w: WIN.w, h: WIN.h - 36 }
const CHAT = { x: BODY.x + 36, y: BODY.y + 24, w: 560, h: BODY.h - 48 }
const PANE = { x: BODY.x + BODY.w - 320, y: BODY.y, w: 320, h: BODY.h }

function chatPanel(biome) {
  const p = PALETTES[biome.id]
  const a = p[p.only].gray.anchors
  const light = p.only === 'light'
  const ink = a['text-primary']
  const soft = a['text-secondary']
  const edge = light ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.09)'
  const c = CHAT
  return `<clipPath id="glass-${biome.id}"><rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="14"/></clipPath>` +
    `<g clip-path="url(#glass-${biome.id})"><g filter="url(#frost)">${scene(biome, BODY.x, BODY.y, BODY.w, BODY.h)}</g></g>` +
    `<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="14" fill="${biome.glass.tint}" fill-opacity="${Math.min(0.8, biome.glass.opacity + 0.14)}" stroke="${edge}"/>` +
    rect(c.x + c.w - 352, c.y + 28, 324, 44, light ? 'rgba(255,255,255,.75)' : 'rgba(255,255,255,.08)', 'rx="12"') +
    text(c.x + c.w - 338, c.y + 56, 14, ink, 'can you make the header sticky on mobile?') +
    `<circle cx="${c.x + 32}" cy="${c.y + 106}" r="4" fill="${p.roles.accent}"/>` +
    text(c.x + 48, c.y + 111, 15, ink, "Sure. I'll scout the styles first, then patch it.") +
    text(c.x + 48, c.y + 148, 13, soft, 'Edit  src/styles/nav.css', `font-family="${MONO}"`) +
    rect(c.x + 48, c.y + 164, c.w - 88, 60, light ? 'rgba(0,0,0,.05)' : 'rgba(0,0,0,.3)', 'rx="8"') +
    text(c.x + 62, c.y + 188, 13, p.roles.danger, '-  .nav { position: absolute; }', `font-family="${MONO}"`) +
    text(c.x + 62, c.y + 210, 13, p.roles.success, '+  .nav { position: sticky; top: 0; }', `font-family="${MONO}"`) +
    rect(c.x + 18, c.y + c.h - 74, c.w - 36, 54, a['surface-2'], `rx="10" stroke="${edge}"`)
}

function biomeLayer(biome, from, to, index) {
  const p = PALETTES[biome.id]
  const a = p[p.only].gray.anchors
  const command = `/overworld ${biome.id}`
  const prev = BIOMES[(index + BIOMES.length - 1) % BIOMES.length]
  const prevInk = PALETTES[prev.id][PALETTES[prev.id].only].gray.anchors['text-primary']
  const typed = typing(CHAT.x + 38, CHAT.y + CHAT.h - 40, command.length, 9.6, from - 1.4, to - 1.4)
  // The command is typed into the previous biome's message box, then the wipe brings in the new one.
  const prevBox = PALETTES[prev.id][PALETTES[prev.id].only].gray.anchors['surface-2']
  const typedLine = index === 0 ? '' : `<g class="${shown(from - 1.5, from, true)}">${rect(CHAT.x + 22, CHAT.y + CHAT.h - 70, CHAT.w - 44, 46, prevBox, 'rx="8"')}${typed.clip}<g clip-path="${typed.ref}">${text(CHAT.x + 38, CHAT.y + CHAT.h - 40, 16, prevInk, command, `font-family="${MONO}"`)}</g></g>`
  return `<g class="${shown(from, to, true)}">` +
    scene(biome, BODY.x, BODY.y, BODY.w, BODY.h) + chatPanel(biome) +
    text(CHAT.x + 38, CHAT.y + CHAT.h - 40, 15, a['text-muted'], 'Reply to Claude…') +
    '</g>' + typedLine
}

/** The block wipe: dirt and stone squares cover the window in a diagonal sweep and clear again. */
function wipes(times) {
  const cell = 80
  const cols = Math.ceil(BODY.w / cell)
  const rows = Math.ceil(BODY.h / cell)
  let out = ''
  for (let r = 0; r < rows; r += 1) {
    for (let col = 0; col < cols; col += 1) {
      const lag = (col + r) * 0.018
      const c = id('w')
      let frames = '0%{opacity:0}'
      for (const t of times) {
        const a = t - 0.34 + lag
        const b = t + 0.08 + lag
        frames += `${pct(a - 0.01)}%{opacity:0}${pct(a)}%,${pct(b)}%{opacity:1}${pct(b + 0.01)}%{opacity:0}`
      }
      css += `.${c}{opacity:0;animation:${c} ${T}s linear infinite}@keyframes ${c}{${frames}100%{opacity:0}}`
      const shade = (col * 7 + r * 3) % 4
      const fill = ['#6b4a2e', '#5e4128', '#6f6f74', '#5f5f64'][shade]
      out += rect(BODY.x + col * cell, BODY.y + r * cell, cell, cell, fill, `class="${c}" stroke="rgba(0,0,0,.3)"`)
    }
  }
  return `<clipPath id="body-clip"><rect x="${BODY.x}" y="${BODY.y}" width="${BODY.w}" height="${BODY.h}"/></clipPath><g clip-path="url(#body-clip)">${out}</g>`
}

function hotbar(cx, y, slot, gap, activeAt) {
  const total = BIOMES.length * slot + (BIOMES.length - 1) * gap
  let out = ''
  BIOMES.forEach((b, i) => {
    const x = cx - total / 2 + i * (slot + gap)
    out += rect(x - 3, y - 3, slot + 6, slot + 6, '#2a2c33') + scene(b, x, y, slot, slot) + rect(x, y, slot, slot, 'none', 'stroke="rgba(0,0,0,.5)" stroke-width="3"')
    if (activeAt) {
      const [from, to] = activeAt(i)
      out += `<g class="${shown(from, to, true)}">${rect(x - 6, y - 6, slot + 12, slot + 12, 'none', `stroke="${CREAM}" stroke-width="5"`)}</g>`
    }
  })
  return out
}

function tour(from, to, seg) {
  const window = rect(WIN.x, WIN.y, WIN.w, WIN.h, '#17171b', 'rx="14"') + rect(WIN.x, WIN.y, WIN.w, 36, '#0f0f12', 'rx="14"') + rect(WIN.x, WIN.y + 20, WIN.w, 16, '#0f0f12') +
    [0, 1, 2].map(i => `<circle cx="${WIN.x + 20 + i * 18}" cy="${WIN.y + 18}" r="5.5" fill="#3a3a40"/>`).join('') +
    text(WIN.x + WIN.w / 2, WIN.y + 23, 13, '#8e8e96', 'Claude Code', 'text-anchor="middle"')
  const layers = BIOMES.map((b, i) => biomeLayer(b, from + i * seg, i === BIOMES.length - 1 ? to : from + (i + 1) * seg, i)).join('')
  const boundaries = BIOMES.slice(1).map((_, i) => from + (i + 1) * seg)
  const signs = BIOMES.map((b, i) => {
    const s = from + i * seg
    const e = i === BIOMES.length - 1 ? from + BIOMES.length * seg : from + (i + 1) * seg
    return `<g class="${stepIn(s + 0.1, e, 12)}">${sign(WIN.x, 740, 520, 110, [[esc(b.title), 30, 'font-weight="700"'], [esc(b.blurb.replace(/^[^.]+\.\s*/, '')), 16]])}</g>`
  }).join('')
  const bar = hotbar(WIN.x + WIN.w - 290, 770, 50, 10, i => [from + i * seg, i === BIOMES.length - 1 ? from + BIOMES.length * seg : from + (i + 1) * seg])
  return `<g class="${shown(from, to)}">` + window + layers + wipes(boundaries) + `<g class="${shown(from, from + BIOMES.length * seg)}">${signs}${bar}</g>` + '</g>'
}

// ---------------------------------------------------------------- the Party

function party(from, to) {
  const x = PANE.x
  // The tour ends in Deep Dark, so the pane wears Deep Dark's colours.
  const dp = PALETTES.deep.dark.gray.anchors
  const accent = glow('deep')
  const card = (i, mob, name, task, tool, tokens, share, at, failed = false) => {
    const y = PANE.y + 56 + i * 124
    const boom = failed ? burst(x + 52, y + 50, at + 2.4) : ''
    return `<g class="${stepIn(at, to, 16)}">` +
      rect(x + 14, y, PANE.w - 28, 112, dp['surface-1'], `rx="8" stroke="${failed ? 'rgba(255,138,138,.45)' : 'rgba(255,255,255,.08)'}"`) +
      `<g class="${shown(at, failed ? at + 2.4 : to, true)}">${mini(mob, 64, x + 22, y + 22)}</g>` +
      (failed ? `<g class="${shown(at + 2.4, to, true)}">${mini(mob, 64, x + 22, y + 22, true)}</g>` : '') +
      `<text x="${x + 98}" y="${y + 30}" font-size="15" font-weight="600" fill="${dp['text-primary']}">${esc(name)}</text>` +
      (failed ? `<g class="${shown(at + 2.4, to, true)}">${text(x + 98 + name.length * 8.6, y + 30, 15, '#ff8a8a', ' · blew up', 'font-weight="600"')}</g>` : '') +
      text(x + 98, y + 52, 12.5, dp['text-secondary'], task) +
      text(x + 98, y + 72, 12, dp['text-muted'], tool, `font-family="${MONO}"`) +
      text(x + 98, y + 96, 12, accent, 'XP', `font-family="${MONO}"`) +
      rect(x + 122, y + 88, 110, 8, 'rgba(255,255,255,.12)') +
      rect(x + 122, y + 88, 110, 8, failed ? '#ff8a8a' : accent, `class="${grow(at + 0.3, at + 3.6, share)}"`) +
      text(x + 240, y + 96, 12, dp['text-muted'], tokens, `font-family="${MONO}"`) +
      boom + '</g>'
  }
  return `<g class="${slideIn(from, to, 340)}">` +
    rect(x, PANE.y, PANE.w, PANE.h, dp['surface-0'], 'fill-opacity="0.97"') + rect(x, PANE.y, 2, PANE.h, 'rgba(255,255,255,.08)') +
    text(x + 18, PANE.y + 34, 13, accent, 'PARTY', `font-family="${MONO}" font-weight="700"`) +
    text(x + PANE.w - 18, PANE.y + 34, 12, dp['text-muted'], '4 out · 74.1k tokens', `font-family="${MONO}" text-anchor="end"`) +
    card(0, 'parrot', 'Explore', 'Find where the nav gets styled', '↳ Grep "position" src/', '24.6k', 0.5, from + 1.2) +
    card(1, 'fox', 'general-purpose', 'Make the header sticky', '↳ Edit src/styles/nav.css', '31.2k', 0.65, from + 2.4) +
    card(2, 'wolf', 'code-reviewer', 'Review the nav change', '↳ Read Header.tsx', '12.9k', 0.3, from + 3.6) +
    card(3, 'creeper', 'test-runner', 'Run the e2e suite', '↳ Bash npm run e2e', '5.4k', 0.12, from + 4.8, true) +
    '</g>' +
    `<g class="${stepIn(from + 0.6, to, 12)}">${sign(WIN.x, 740, 620, 110, [['Every agent spawns in as a mob.', 28, 'font-weight="700"'], ['Live tool, exact tokens, an XP bar. Creepers blow up.', 16]])}</g>`
}

/** A one-off burst of blocks, for the creeper. */
function burst(cx, cy, at) {
  const bits = [[-40, -30], [36, -34], [-46, 18], [44, 22], [-10, -48], [14, 44], [-30, 40], [40, -6]]
  return bits.map(([dx, dy], i) => {
    const c = id('b')
    css += `.${c}{opacity:0;animation:${c} ${T}s steps(${Math.round(T * 8)},end) infinite}@keyframes ${c}{0%,${pct(at)}%{opacity:0;transform:translate(0,0)}${pct(at + 0.05)}%{opacity:1;transform:translate(0,0)}${pct(at + 1.1)}%{opacity:0;transform:translate(${dx}px,${dy}px)}100%{opacity:0}}`
    return rect(cx - 6, cy - 6, 12, 12, i % 2 ? '#6fbf5a' : '#4f9a44', `class="${c}"`)
  }).join('')
}

// ---------------------------------------------------------------- the finale

/** Finale hotbar slot size and gap: ten slots across the frame. */
const SLOT = 128
const GAP = 12

function finale(from, to) {
  return `<g class="${shown(from, to)} trfinal">` +
    text(W / 2, 170, 54, CREAM, 'Pick your biome.', 'text-anchor="middle" font-weight="700"') +
    `<g class="${stepIn(from + 0.4, to)}">${hotbar(W / 2, 260, SLOT, GAP)}</g>` +
    BIOMES.map((b, i) => `<g class="${stepIn(from + 0.6 + i * 0.08, to, 10)}">${text(W / 2 - (BIOMES.length * SLOT + (BIOMES.length - 1) * GAP) / 2 + i * (SLOT + GAP) + SLOT / 2, 260 + SLOT + 34, 14, glow(b.id), b.id, `text-anchor="middle" font-family="${MONO}"`)}</g>`).join('') +
    `<g class="${stepIn(from + 1.4, to)}">${sign(W / 2 - 440, 500, 880, 120, [[`<tspan fill="#c8f0a8">/plugin install</tspan> overworld --marketplace abdullahafaq/claude-overworld`, 21, `font-family="${MONO}"`], [`then <tspan fill="#c8f0a8">/overworld</tspan> · free, MIT, looks only`, 17]])}</g>` +
    '</g>'
}

export function trailer() {
  css = ''
  n = 0
  const SEG = 2.8
  const tourStart = 4.6
  const tourEnd = tourStart + SEG * BIOMES.length // 32.6 with ten biomes
  const body = opening(0, tourStart) +
    tour(tourStart, 44, SEG) +
    party(tourEnd, 44) +
    finale(44, T)

  const stars = Array.from({ length: 60 }, (_, i) => rect((i * 263) % W, (i * 137) % 640, i % 5 ? 2 : 3, i % 5 ? 2 : 3, '#e8e4ff', `opacity="${0.3 + (i % 4) * 0.15}"`)).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Overworld trailer: a world generates and the OVERWORLD logo is built block by block; then the command /overworld is typed in a Claude Code window and each of the ten biomes swaps in with a block wipe; then the Party pane slides in and agents spawn as mobs, a creeper blowing up; it ends on a hotbar of every biome and the install command.">` +
    `<title>Overworld for Claude Code: trailer</title>` +
    `<style>text{font-family:${SANS}}${css}` +
    `@media (prefers-reduced-motion:reduce){*{animation:none!important}[class^="tr"]{opacity:0}.trfinal,.trfinal *{opacity:1!important;transform:none!important}}</style>` +
    `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SKY_TOP}"/><stop offset="1" stop-color="${SKY_LOW}"/></linearGradient>` +
    `<filter id="frost" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="12"/></filter>${BIOMES.map(sceneSymbol).join('')}</defs>` +
    rect(0, 0, W, H, 'url(#sky)') + stars + ground(860) + body + '</svg>'
}
