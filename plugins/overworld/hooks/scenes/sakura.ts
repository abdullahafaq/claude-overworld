// Sakura Night: a cherry grove under a pink moon. Lanterns sway, petals drift down, fireflies blink
// over the pond, and a fox and a frog are hanging out by the water.

import { mob } from '../mobs'
import { Defs, GROUND, HEIGHT, MOB_LEFT, WIDTH, heights, light, rect, ridge, specks, svg } from '../pixels'
import { lantern, tree } from '../props'

const PETALS: ReadonlyArray<readonly [number, number]> = [[300, 120], [520, 60], [640, 200], [760, 90], [880, 160], [1000, 40], [1120, 140], [1240, 80], [1360, 180], [1460, 100], [420, 260], [1300, 300], [1180, 260], [1520, 240]]

export function sakura(still = false): string {
  const defs = new Defs()
  const sky = defs.vertical([[0, '#100c1c'], [0.55, '#24172f'], [1, '#43263e']])
  const petals = PETALS.map(([x, y], i) => rect(x, y, 7, 7, i % 3 ? '#f4a9c4' : '#fbd0de', `class="fall" style="animation-delay:-${(i * 1.7).toFixed(1)}s;animation-duration:${12 + (i % 4) * 2}s"`)).join('')

  const body =
    rect(0, 0, WIDTH, HEIGHT, sky) +
    specks(40, { x: 0, y: 0, w: WIDTH, h: 420 }, 3, '#fff0f6', 3, 'twinkle') +
    `<g class="breathe">${light(defs, 1260, 230, 190, '#fbe0ec', 0.35)}</g>` +
    rect(1220, 190, 80, 80, '#fbe8f0') + rect(1240, 206, 14, 14, '#f3d6e2') + rect(1268, 236, 18, 18, '#f3d6e2') +
    ridge(heights(25, 300, 110, 21), '#2c1b32') +
    light(defs, 800, 620, 700, '#8c4670', 0.18) +
    ridge(heights(20, 220, 70, 25), '#20152a') +
    light(defs, 420, 600, 170, '#f08cb4', 0.22) + light(defs, 1440, 560, 190, '#f08cb4', 0.22) +
    tree(330, GROUND, 1.35, '#3a2420', '#d9709a', '#f09ab8') +
    tree(760, GROUND, 1.0, '#3a2420', '#e07aa2', '#f4a6c2') +
    tree(1380, GROUND, 1.5, '#3a2420', '#d46592', '#ec92b4') +
    lantern(defs, 446, 560, 60, 0) + lantern(defs, 1440, 500, 80, 1.6) + lantern(defs, 830, 650, 40, 3.1) +
    rect(0, GROUND, WIDTH, HEIGHT - GROUND, '#1b1219') + rect(0, GROUND, WIDTH, 14, '#3b5a3c') + rect(0, GROUND + 14, WIDTH, 6, '#2e4a30') +
    rect(560, GROUND - 10, 380, 14, '#3a2c50') +
    rect(740, GROUND - 8, 34, 4, '#fbe8f0', 'class="shimmer" opacity="0.6"') + rect(716, GROUND - 2, 84, 3, '#fbe8f0', 'class="shimmer" opacity="0.35" style="animation-delay:-1.5s"') +
    petals +
    `<g class="pulse">${light(defs, 1130, 640, 16, '#ffe39a', 0.9)}${light(defs, 1290, 600, 16, '#ffe39a', 0.9)}</g>` +
    `<g class="pulse" style="animation-delay:-1.6s">${light(defs, 1220, 720, 16, '#ffe39a', 0.9)}${light(defs, 1020, 700, 14, '#ffe39a', 0.9)}</g>` +
    mob('fox', MOB_LEFT, GROUND, 6, 0) + mob('frog', MOB_LEFT + 116, GROUND, 6, 1.3)

  return svg('Sakura Night: cherry trees under a pink moon, swaying lanterns and drifting petals, a fox and a frog by a pond', defs, body, still)
}
