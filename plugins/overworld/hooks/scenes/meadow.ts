// Meadow: the one light theme. A sunny morning in the plains: clouds drifting over the hills, a little
// house, flowers, a cat stretching and a bee doing its rounds.

import { mob } from '../mobs'
import { Defs, GROUND, HEIGHT, MOB_LEFT, WIDTH, heights, light, rect, ridge, svg } from '../pixels'
import { house, tree } from '../props'

function cloud(x: number, y: number, w: number): string {
  return rect(x, y, w, 26, '#ffffff', 'opacity="0.9"') + rect(x + w * 0.2, y - 18, w * 0.46, 20, '#ffffff', 'opacity="0.9"')
}

export function meadow(still = false): string {
  const defs = new Defs()
  const sky = defs.vertical([[0, '#a9d0ee'], [0.6, '#d7e8ee'], [1, '#eef0e2']])
  const flowers = [[620, '#f2d25a'], [700, '#e88aa0'], [780, '#f2d25a'], [980, '#9ab8f0'], [1320, '#e88aa0'], [1500, '#f2d25a'], [180, '#e88aa0'], [260, '#f2d25a']]
    .map(([x, c]) => rect(x as number, GROUND - 12, 8, 8, c as string) + rect((x as number) + 3, GROUND - 4, 2, 4, '#4f8a3a')).join('')
  const clouds = cloud(240, 160, 200) + cloud(700, 230, 150) + cloud(1180, 120, 180) + cloud(1500, 260, 140)

  const body =
    rect(0, 0, WIDTH, HEIGHT, sky) +
    light(defs, 1240, 260, 260, '#fff6d8', 0.9) + rect(1196, 216, 88, 88, '#fff8e2') +
    `<g class="drift">${clouds}<g transform="translate(1600 0)">${clouds}</g></g>` +
    ridge(heights(25, 330, 110, 5), '#c6d7d6') +
    light(defs, 800, 640, 700, '#ffffff', 0.25) +
    ridge(heights(25, 250, 80, 9), '#a5c7a0') +
    ridge(heights(20, 180, 48, 13), '#8bbb80') +
    tree(380, GROUND, 1.2, '#7a5a3e', '#5e9c55', '#74b268') +
    tree(1440, GROUND, 1.0, '#7a5a3e', '#5e9c55', '#74b268') +
    house(860, GROUND) +
    rect(0, GROUND, WIDTH, HEIGHT - GROUND, '#9a7656') + rect(0, GROUND, WIDTH, 14, '#7fb86a') + rect(0, GROUND + 14, WIDTH, 6, '#68a157') +
    flowers +
    mob('cat', MOB_LEFT, GROUND, 6, 0) + mob('bee', MOB_LEFT + 110, GROUND - 60, 6, 1.1)

  return svg('Meadow: a sunny morning in the plains, clouds drifting over green hills, a little house, a cat and a bee', defs, body, still)
}
