// Ocean: down on the sea floor. Sunlight comes through in slow beams, kelp sways, a shipwreck rests on
// the sand, fish go by, and an axolotl hangs out with a glow squid.

import { mob } from '../mobs'
import { Defs, GROUND, HEIGHT, MOB_LEFT, WIDTH, heights, light, rect, ridge, specks, svg } from '../pixels'
import { coral, fish, kelp } from '../props'

function shipwreck(x: number, ground: number): string {
  return rect(x, ground - 70, 320, 70, '#2e2620') + rect(x, ground - 82, 320, 12, '#3a3028') +
    rect(x + 250, ground - 130, 90, 60, '#2e2620') + rect(x + 110, ground - 250, 12, 180, '#2e2620') +
    rect(x + 40, ground - 230, 70, 80, '#c8beaa', 'opacity="0.22"') +
    rect(x + 40, ground - 52, 18, 18, '#14202e') + rect(x + 90, ground - 52, 18, 18, '#14202e') + rect(x + 140, ground - 52, 18, 18, '#14202e')
}

export function ocean(still = false): string {
  const defs = new Defs()
  const water = defs.vertical([[0, '#0f3260'], [0.45, '#0b2244'], [1, '#06142a']])
  const beam = defs.vertical([[0, '#96c8ff'], [1, '#0b2244']])
  const beams = [380, 700, 1020, 1340].map((x, i) => `<path d="M${x} 0h90l140 760h-90Z" fill="${beam}" opacity="0.14" class="breathe" style="animation-delay:-${i * 1.5}s"/>`).join('')
  const bubbles = `<g opacity="0.6">${specks(18, { x: 1050, y: 520, w: 300, h: 300 }, 61, '#c8e6ff', 6, 'rise')}</g>`

  const body =
    rect(0, 0, WIDTH, HEIGHT, water) +
    beams +
    ridge(heights(25, 220, 90, 61), '#0c2240') +
    fish(300, 260, 6, '#f0a060', 3) + fish(900, 420, 5, '#f2d25a', 17) +
    shipwreck(400, GROUND) +
    kelp(300, GROUND, 330, 0) + kelp(980, GROUND, 360, 1.4) + kelp(1440, GROUND, 300, 2.6) + kelp(1540, GROUND, 240, 0.8) +
    rect(0, GROUND, WIDTH, HEIGHT - GROUND, '#1c2a44') + rect(0, GROUND, WIDTH, 10, '#2a3a58') +
    coral(200, GROUND, '#e3708f', '#ffa0b8') + coral(820, GROUND, '#f0a060', '#ffc890') + coral(1360, GROUND, '#a77ad8', '#c8a4f0') +
    `<g class="pulse">${light(defs, MOB_LEFT + 150, GROUND - 120, 110, '#4fd8d0', 0.28)}</g>` +
    bubbles +
    mob('axolotl', MOB_LEFT, GROUND, 6, 0) + mob('squid', MOB_LEFT + 118, GROUND - 46, 6, 1.4)

  return svg('Ocean: sunbeams through the water, kelp, coral and a shipwreck on the sea floor, an axolotl and a glow squid', defs, body, still)
}
