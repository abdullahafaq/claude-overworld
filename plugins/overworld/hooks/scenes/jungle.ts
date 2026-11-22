// Jungle: deep green and a little humid. Giant jungle trees with vines swaying, cocoa pods, a mossy temple
// half swallowed by leaves, bamboo, fireflies in the mist, and a panda hanging out with a parrot.

import { mob } from '../mobs'
import { Defs, GROUND, HEIGHT, MOB_LEFT, WIDTH, hash, heights, hills, light, rect, specks, svg, terrain } from '../pixels'

/** A two-wide jungle trunk with a stacked canopy, a few cocoa pods and vines hanging off the leaves. */
function jungleTree(defs: Defs, x: number, h: number, seed: number): string {
  const trunk = '#4a3520'
  const bark = '#3a2918'
  let out = rect(x, GROUND - h, 36, h, trunk)
  for (let y = GROUND - h; y < GROUND; y += 18) out += rect(x + (Math.floor(y / 18) % 2) * 18, y, 6, 10, bark)
  const top = GROUND - h
  // A big lumpy canopy: overlapping leaf blocks in three greens, then speckles so it isn't flat.
  const blobs: Array<[number, number, number, number, string]> = [
    [-130, -30, 300, 80, '#1d5524'], [-100, -90, 240, 70, '#24662a'], [-60, -140, 170, 60, '#2c7630'],
    [-160, 10, 120, 50, '#1a4a20'], [120, 0, 110, 56, '#1a4a20'], [-20, -175, 90, 40, '#34843a'],
  ]
  for (const [dx, dy, w, hh, c] of blobs) out += rect(x + dx, top + dy, w, hh, c)
  for (let i = 0; i < 26; i += 1) {
    out += rect(x - 150 + Math.floor(hash(seed, i) * 36) * 10, top - 170 + Math.floor(hash(seed, i + 40) * 22) * 10, 10, 10, i % 3 ? '#3a8a3a' : '#123a18')
  }
  out += rect(x + 36, top + 40, 10, 14, '#c77a2e') + rect(x - 10, top + 90, 10, 14, '#a8601e')
  for (let i = 0; i < 6; i += 1) {
    const vx = x - 140 + i * 56
    const len = 60 + Math.floor(hash(seed + 9, i) * 6) * 20
    let vine = ''
    for (let y = 0; y < len; y += 12) vine += rect(vx + (Math.floor(y / 12) % 2) * 4, top + 40 + y, 6, 12, '#2f7a34')
    out += `<g class="sway" style="animation-delay:-${(i * 1.3 + (seed % 3)).toFixed(1)}s">${vine}</g>`
  }
  return out + light(defs, x + 18, top - 30, 120, '#6ad07a', 0.06)
}

/** Low leafy bushes along the ground, so the jungle floor feels thick. */
function bushes(seed: number): string {
  let out = ''
  for (let x = -20; x < WIDTH; x += 90 + Math.floor(hash(seed, x) * 70)) {
    if (x > MOB_LEFT - 60 && x < MOB_LEFT + 220) continue
    const w = 70 + Math.floor(hash(seed + 1, x) * 5) * 14
    out += rect(x, GROUND - 40, w, 40, '#1f5a26') + rect(x + 10, GROUND - 58, w - 24, 20, '#2a6e2c') + rect(x + 20, GROUND - 50, 10, 10, '#3a8a3a')
  }
  return out
}

function bamboo(x: number, h: number): string {
  let out = ''
  for (let y = 0; y < h; y += 28) out += rect(x, GROUND - y - 28, 14, 26, y % 56 ? '#5aa03a' : '#4e9032') + rect(x, GROUND - y - 4, 14, 2, '#3a6e26')
  return out + rect(x + 14, GROUND - h + 20, 14, 6, '#5aa03a') + rect(x - 12, GROUND - h + 60, 12, 6, '#5aa03a')
}

/** A stepped temple of mossy stone, mostly hidden behind the trees. */
function temple(x: number): string {
  const stone = '#66705f'
  const moss = '#4c7a3e'
  let out = ''
  ;[320, 270, 220, 160].forEach((w, i) => {
    out += rect(x + (320 - w) / 2, GROUND - (i + 1) * 40, w, 40, stone) + rect(x + (320 - w) / 2, GROUND - (i + 1) * 40, w, 8, moss)
  })
  return out + rect(x + 136, GROUND - 60, 48, 60, '#12180f') + rect(x + 100, GROUND - 150, 16, 16, moss) + rect(x + 210, GROUND - 110, 20, 14, moss)
}

export function jungle(still = false): string {
  const defs = new Defs()
  const sky = defs.vertical([[0, '#07120c'], [0.55, '#0e2418'], [1, '#18382a']])

  const body =
    rect(0, 0, WIDTH, HEIGHT, sky) +
    specks(30, { x: 0, y: 0, w: WIDTH, h: 300 }, 81, '#dff5e0', 2, 'twinkle') +
    `<g class="breathe">${light(defs, 1240, 210, 150, '#e6f4d8', 0.22)}</g>` + rect(1206, 176, 68, 68, '#e6f0d4') + rect(1222, 194, 12, 12, '#cfdcbc') +
    hills(defs, heights(25, 330, 120, 81), '#0f2a1a', '#163a22', 81) +
    light(defs, 800, 640, 700, '#3a8a5a', 0.12) +
    hills(defs, heights(20, 200, 60, 85), '#0c2014', '#12301c', 85) +
    temple(540) +
    jungleTree(defs, 250, 440, 3) + jungleTree(defs, 960, 380, 7) + jungleTree(defs, 1500, 470, 11) +
    bamboo(150, 220) + bamboo(190, 280) + bamboo(1340, 240) + bamboo(1380, 190) +
    bushes(81) +
    terrain(defs, { top: '#3e8a36', topDark: '#2c6a2a', soil: '#3a2a1c', specks: ['#2e2216', '#46321f', '#33261a'], tufts: '#4fa040' }, 81) +
    `<g class="pulse">${light(defs, 1020, 640, 14, '#e6f59a', 0.9)}${light(defs, 1300, 580, 14, '#e6f59a', 0.9)}</g>` +
    `<g class="pulse" style="animation-delay:-1.7s">${light(defs, 700, 600, 14, '#e6f59a', 0.9)}${light(defs, 1160, 700, 14, '#e6f59a', 0.9)}</g>` +
    mob('panda', MOB_LEFT, GROUND, 6, 0) + mob('parrot', MOB_LEFT + 104, GROUND - 40, 6, 1.2)

  return svg('Jungle: giant jungle trees with swaying vines, bamboo, a mossy temple and fireflies, a panda and a parrot', defs, body, still)
}
