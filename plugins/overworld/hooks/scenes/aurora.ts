// Aurora: a frozen night in the snowy taiga. The northern lights ripple over the peaks, snow drifts
// down, there's an igloo with its door open, and a snow fox and a wolf keep watch.

import { mob } from '../mobs'
import { Defs, GROUND, HEIGHT, MOB_LEFT, WIDTH, heights, hills, rect, ridge, specks, svg, terrain } from '../pixels'
import { igloo, spruce } from '../props'

export function aurora(still = false): string {
  const defs = new Defs()
  const sky = defs.vertical([[0, '#050a14'], [0.6, '#0b1626'], [1, '#14263a']])
  const bandA = defs.horizontal([[0, '#6ef0b4', 0], [0.25, '#6ef0b4', 0.55], [0.55, '#78d2ff', 0.45], [0.8, '#b48cff', 0.35], [1, '#b48cff', 0]])
  const bandB = defs.horizontal([[0, '#78faba', 0], [0.4, '#78faba', 0.4], [0.75, '#8cc8ff', 0.3], [1, '#8cc8ff', 0]])
  const snow = specks(46, { x: 200, y: 0, w: 1400, h: 120 }, 41, '#ffffff', 5, 'fall')

  const body =
    rect(0, 0, WIDTH, HEIGHT, sky) +
    specks(60, { x: 0, y: 0, w: WIDTH, h: 460 }, 37, '#e6f4ff', 3, 'twinkle') +
    `<g class="breathe"><path d="M0 230 L400 150 L800 190 L1200 110 L1600 170 L1600 250 L1200 190 L800 270 L400 230 L0 310Z" fill="${bandA}"/></g>` +
    `<g class="breathe" style="animation-delay:-3s"><path d="M200 330 L600 270 L1000 310 L1400 250 L1600 280 L1600 330 L1400 300 L1000 360 L600 320 L200 380Z" fill="${bandB}"/></g>` +
    ridge(heights(20, 380, 130, 41), '#93a6bc') +
    ridge(heights(20, 350, 130, 41), '#2a3a4e') +
    hills(defs, heights(20, 230, 70, 45), '#1c2a3a', '#2a3c50', 45) +
    spruce(300, GROUND, 280, '#14221e', '#dfe8f2') + spruce(820, GROUND, 320, '#14221e', '#dfe8f2') + spruce(1480, GROUND, 300, '#14221e', '#dfe8f2') + spruce(160, GROUND, 220, '#18291f', '#dfe8f2') +
    igloo(600, GROUND) +
    terrain(defs, { top: '#c8d6e4', topDark: '#9aabbe', soil: '#6a7c92', specks: ['#76889e', '#5e7086', '#8294aa'] }, 41) +
    `<g opacity="0.75">${snow}</g>` +
    mob('snowfox', MOB_LEFT, GROUND, 6, 0) + mob('wolf', MOB_LEFT + 108, GROUND, 6, 0.7)

  return svg('Aurora: northern lights rippling over snowy peaks, spruces and an igloo, a snow fox and a wolf in the snow', defs, body, still)
}
