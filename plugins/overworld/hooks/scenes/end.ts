// The End: the void past the portal. End city towers glow purple, crystals hum on obsidian pillars,
// chorus plants grow out of the pale stone, a dragon glides over now and then, and two endermen
// pretend they aren't watching you.

import { mob } from '../mobs'
import { Defs, GROUND, HEIGHT, MOB_LEFT, WIDTH, light, rect, ridge, specks, svg, terrain } from '../pixels'
import { chorus } from '../props'

function tower(x: number, top: number, w: number): string {
  let windows = ''
  for (let y = top + 50; y < GROUND - 60; y += 90) windows += rect(x + w / 2 - 6, y, 12, 20, '#d38cf0', 'class="pulse"')
  return rect(x, top, w, GROUND - top, '#3e2e52') + rect(x - 14, top - 24, w + 28, 26, '#4c3864') + rect(x + w * 0.2, top - 70, w * 0.6, 48, '#3e2e52') + rect(x + w * 0.1, top - 86, w * 0.8, 18, '#4c3864') + windows
}

function pillar(defs: Defs, x: number, top: number): string {
  return rect(x, top, 60, GROUND - top, '#191226') +
    `<g class="pulse">${light(defs, x + 30, top - 18, 60, '#f0d0ff', 0.55)}</g>` + rect(x + 14, top - 34, 32, 32, '#f0d0ff')
}

function dragon(): string {
  const d = '#120c1a'
  const shape = `<path d="M0 60 L90 0 L120 46 L150 0 L240 60 Z" fill="${d}"/>` + rect(40, 56, 180, 26, d) + rect(220, 50, 50, 28, d) + rect(-60, 64, 100, 12, d) + rect(256, 58, 8, 6, '#c86bff')
  return `<g class="glide" style="animation-duration:90s"><g transform="translate(0 120)">${shape}</g></g>`
}

export function end(still = false): string {
  const defs = new Defs()
  const sky = defs.vertical([[0, '#08060f'], [0.6, '#140d24'], [1, '#1f1533']])

  const body =
    rect(0, 0, WIDTH, HEIGHT, sky) +
    specks(70, { x: 0, y: 0, w: WIDTH, h: 600 }, 71, '#e2d2ff', 3, 'twinkle') +
    dragon() +
    tower(1300, 330, 96) + tower(260, 420, 76) +
    pillar(defs, 560, 420) + pillar(defs, 960, 500) +
    `<path d="M590 404 L1100 760" stroke="#f0d0ff" stroke-width="3" opacity="0.25" class="breathe"/>` +
    light(defs, 800, 720, 600, '#7a5aaa', 0.2) +
    ridge([150, 160, 170, 170, 180, 180, 190, 190, 190, 200, 200, 190, 190, 180, 180, 170, 160, 150, 150, 140], '#cfcb98', GROUND + 10) +
    terrain(defs, { top: '#e4e0b0', topDark: '#c4c08c', soil: '#d8d4a2', specks: ['#ccc896', '#e2deac', '#c2be8a'] }, 71) + rect(0, GROUND, WIDTH, HEIGHT - GROUND, '#281846', 'opacity="0.35"') +
    chorus(760, GROUND, 150) + chorus(880, GROUND, 110) + chorus(430, GROUND, 96) + chorus(1520, GROUND, 120) +
    mob('enderman', MOB_LEFT + 20, GROUND, 5, 0) + mob('enderman', MOB_LEFT + 110, GROUND, 4, 1.8)

  return svg('The End: glowing end city towers, crystal pillars, chorus plants, a dragon gliding past and two endermen', defs, body, still)
}
