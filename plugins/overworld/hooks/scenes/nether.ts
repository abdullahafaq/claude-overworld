// Nether: hot, loud and somehow cosy. A fortress bridge runs overhead, lava pours down the walls,
// crimson fungi glow, a ghast drifts in the haze, and a strider and a magma cube chill by the lava.

import { mob } from '../mobs'
import { Defs, GROUND, HEIGHT, MOB_LEFT, WIDTH, ceiling, heights, hills, light, rect, specks, svg, terrain } from '../pixels'
import { fungus } from '../props'

function lavafall(defs: Defs, x: number, w: number, bottom: number): string {
  const lava = defs.vertical([[0, '#ff8a3a'], [1, '#ffb35a']])
  let ripples = ''
  for (let y = -32; y < bottom; y += 32) ripples += rect(x, y, w, 10, '#ffd27a', 'opacity="0.5"')
  return rect(x, 0, w, bottom, lava) + `<svg x="${x}" y="0" width="${w}" height="${bottom}" overflow="hidden"><g class="flow">${ripples.replace(new RegExp(`x="${x}"`, 'g'), 'x="0"')}</g></svg>`
}

function bridge(): string {
  let out = rect(0, 400, WIDTH, 28, '#2e1414') + rect(0, 392, WIDTH, 8, '#3a1a18')
  for (let x = 80; x < WIDTH; x += 260) out += rect(x, 428, 48, GROUND - 428, '#241010') + rect(x - 10, 428, 68, 14, '#2e1414')
  return out
}

function ghast(): string {
  const w = '#f0f0f4'
  return `<g class="hover" opacity="0.55"><g transform="translate(470 190)">${rect(0, 0, 64, 52, w)}${rect(12, 14, 10, 10, '#4a4a55')}${rect(42, 14, 10, 10, '#4a4a55')}${rect(24, 34, 16, 6, '#4a4a55')}${rect(6, 52, 4, 22, w)}${rect(22, 52, 4, 30, w)}${rect(38, 52, 4, 18, w)}${rect(54, 52, 4, 26, w)}</g></g>`
}

export function nether(still = false): string {
  const defs = new Defs()
  const haze = defs.vertical([[0, '#1a0909'], [0.6, '#3a1310'], [1, '#561f14']])
  const lavaSea = defs.vertical([[0, '#ffa050'], [1, '#d9542a']])
  const ash = `<g opacity="0.45">${specks(26, { x: 0, y: 500, w: WIDTH, h: 400 }, 81, '#ffc8aa', 4, 'rise')}</g>`

  const body =
    rect(0, 0, WIDTH, HEIGHT, haze) +
    ceiling(heights(25, 70, 110, 71), '#2a0f0e') +
    `<g class="breathe">${light(defs, 420, 90, 80, '#ffd27a', 0.6)}${light(defs, 1080, 110, 80, '#ffd27a', 0.6)}</g>` +
    rect(398, 70, 44, 30, '#ffd27a') + rect(430, 96, 26, 18, '#ffd27a') + rect(1060, 94, 40, 26, '#ffd27a') +
    ghast() +
    hills(defs, heights(25, 300, 90, 73), '#3a1614', '#4a1d1a', 73) +
    light(defs, 800, 620, 700, '#a03a20', 0.25) +
    bridge() +
    lavafall(defs, 300, 18, 400) + lavafall(defs, 1500, 24, GROUND) +
    `<g class="pulse">${light(defs, 1512, GROUND, 120, '#ff8c3c', 0.4)}</g>` +
    `<g class="pulse" style="animation-delay:-1.6s">${light(defs, 990, 690, 160, '#a064f0', 0.3)}</g>` +
    rect(944, 560, 92, 220, '#1d1228') + rect(958, 574, 64, 206, '#8f62e0', 'opacity="0.85"') +
    fungus(defs, 690, GROUND, 140, '#a8283a') + fungus(defs, 220, GROUND, 170, '#9a2234') +
    terrain(defs, { top: '#8a2a3a', topDark: '#5e1c28', soil: '#4a1d19', specks: ['#5a2420', '#3e1614', '#62281f'], tufts: '#b0303f' }, 73) + rect(0, GROUND + 50, WIDTH, HEIGHT - GROUND - 50, lavaSea) +
    light(defs, 800, HEIGHT, 520, '#ff7832', 0.3) +
    ash +
    mob('strider', MOB_LEFT, GROUND, 6, 0) + mob('magma', MOB_LEFT + 100, GROUND, 6, 1.1)

  return svg('Nether: a fortress bridge over lava falls, glowing crimson fungi, a ghast in the haze, a strider and a magma cube', defs, body, still)
}
