// Badlands: striped terracotta mesas at sunset. An old mineshaft cut into the cliff, dead bushes, dust
// drifting over red sand, and an armadillo who's made friends with a wolf.

import { mob } from '../mobs'
import { Defs, GROUND, HEIGHT, MOB_LEFT, WIDTH, hash, heights, hills, light, rect, specks, svg, terrain } from '../pixels'

const BANDS = ['#b8562e', '#d08850', '#8a3a24', '#c9a07a', '#a0482a', '#d9a066', '#93432a']

/** A mesa: wide at the foot, narrowing in steps toward a flat top, banded in terracotta, with a few eroded notches. */
function mesa(x: number, w: number, h: number, seed: number): string {
  let out = ''
  const band = 22
  const rows = Math.ceil(h / band)
  for (let r = 0; r < rows; r += 1) {
    const fromTop = r / rows
    const inset = Math.round((1 - fromTop) * w * 0.14 / 8) * 8 + (hash(seed, r) > 0.7 ? 8 : 0)
    const y = GROUND - h + r * band
    out += rect(x + inset, y, w - inset * 2, band, BANDS[(r + seed) % BANDS.length]!)
    if (hash(seed + 2, r) > 0.8) out += rect(x + inset + Math.floor(hash(seed + 3, r) * (w - 2 * inset - 30)), y, 24, band, '#5a2418', 'opacity="0.55"')
  }
  const cap = Math.round(w * 0.14 / 8) * 8
  return out + rect(x + cap - 8, GROUND - h - 8, w - cap * 2 + 16, 10, '#c97a48')
}

function mineshaft(x: number): string {
  const beam = '#6b4a2e'
  return rect(x, GROUND - 110, 120, 110, '#1a0f0a') + rect(x - 10, GROUND - 120, 140, 14, beam) + rect(x - 4, GROUND - 120, 14, 120, beam) + rect(x + 110, GROUND - 120, 14, 120, beam) +
    rect(x + 20, GROUND - 6, 80, 4, '#7a7a80') + rect(x + 26, GROUND - 4, 6, 4, beam) + rect(x + 56, GROUND - 4, 6, 4, beam) + rect(x + 86, GROUND - 4, 6, 4, beam)
}

function deadBush(x: number): string {
  const c = '#7a5434'
  return rect(x, GROUND - 22, 4, 22, c) + rect(x - 10, GROUND - 30, 10, 4, c) + rect(x + 4, GROUND - 36, 12, 4, c) + rect(x - 14, GROUND - 40, 4, 10, c) + rect(x + 16, GROUND - 46, 4, 10, c)
}

export function badlands(still = false): string {
  const defs = new Defs()
  const sky = defs.vertical([[0, '#24132c'], [0.45, '#5a2a34'], [0.78, '#b0563a'], [1, '#e08a4e']])
  let dust = ''
  for (let i = 0; i < 6; i += 1) dust += rect(100 + i * 260 + hash(5, i) * 80, 300 + hash(6, i) * 120, 90, 6, '#ffd2a8', 'opacity="0.12"')

  const body =
    rect(0, 0, WIDTH, HEIGHT, sky) +
    specks(24, { x: 0, y: 0, w: WIDTH, h: 220 }, 91, '#ffe8d8', 2, 'twinkle') +
    `<g class="breathe">${light(defs, 820, 560, 300, '#ffb070', 0.45)}</g>` + rect(760, 500, 120, 120, '#ffc98a') +
    `<g class="drift" style="animation-duration:90s">${dust}<g transform="translate(1600 0)">${dust}</g></g>` +
    hills(defs, heights(25, 230, 50, 91), '#6a2e26', '#7e3a2e', 91) +
    mesa(60, 420, 380, 1) + mesa(1150, 360, 430, 4) + mesa(600, 240, 240, 6) +
    mineshaft(1270) +
    deadBush(520) + deadBush(980) + deadBush(1520) +
    terrain(defs, { top: '#c8683a', topDark: '#a4522e', soil: '#9a4a2a', specks: ['#a85636', '#8a3e22', '#b46040'], tufts: '#7a5434' }, 91) +
    mob('armadillo', MOB_LEFT, GROUND, 6, 0) + mob('wolf', MOB_LEFT + 96, GROUND, 6, 0.8)

  return svg('Badlands: banded terracotta mesas at sunset, an old mineshaft and dead bushes, an armadillo and a wolf', defs, body, still)
}
