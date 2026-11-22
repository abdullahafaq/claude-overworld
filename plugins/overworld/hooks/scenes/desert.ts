// Desert Night: a clear sky over the dunes, a temple with candles at the door, a tumbleweed that rolls
// past every so often, and a creeper who really should not be this close to a cat.

import { mob } from '../mobs'
import { Defs, GROUND, HEIGHT, MOB_LEFT, WIDTH, heights, hills, light, rect, specks, svg, terrain } from '../pixels'
import { cactus, candle, pyramid } from '../props'

function tumbleweed(): string {
  const weed = rect(0, -26, 26, 26, '#8a6a3e') + rect(4, -22, 18, 18, '#6e5230') + rect(8, -30, 10, 4, '#8a6a3e')
  return `<g class="glide" style="animation-duration:70s"><g transform="translate(0 ${GROUND})">${weed}</g></g>`
}

export function desert(still = false): string {
  const defs = new Defs()
  const sky = defs.vertical([[0, '#0b0f22'], [0.5, '#1c1c3a'], [0.82, '#4a3448'], [1, '#7a4e40']])

  const body =
    rect(0, 0, WIDTH, HEIGHT, sky) +
    specks(70, { x: 0, y: 0, w: WIDTH, h: 520 }, 11, '#fff4dc', 3, 'twinkle') +
    specks(30, { x: 0, y: 0, w: WIDTH, h: 400 }, 12, '#fff4dc', 2) +
    `<g class="breathe">${light(defs, 1260, 240, 200, '#f6e6c4', 0.3)}</g>` +
    rect(1216, 196, 88, 88, '#f6e6c4') + rect(1236, 216, 16, 16, '#e2d0aa') + rect(1268, 248, 20, 20, '#e2d0aa') +
    hills(defs, heights(25, 260, 60, 31), '#2c2430', '#3a3040', 31) +
    pyramid(560, GROUND, 480, 7, '#6a5440', '#7e6650') +
    candle(defs, 516, GROUND, 0) + candle(defs, 596, GROUND, 1.2) +
    hills(defs, heights(20, 160, 40, 35), '#3a2e24', '#4a3c2e', 35) +
    cactus(980, GROUND, 110, '#2f4a2e') + cactus(1480, GROUND, 84, '#2f4a2e') + cactus(200, GROUND, 96, '#2f4a2e') +
    terrain(defs, { top: '#6a5438', topDark: '#544330', soil: '#4a3a28', specks: ['#54432e', '#403222', '#5a4834'] }, 31) +
    tumbleweed() +
    mob('creeper', MOB_LEFT + 6, GROUND, 6, 0) + mob('cat', MOB_LEFT + 76, GROUND, 6, 0.9)

  return svg('Desert Night: a starry sky over the dunes, a temple with candles, cacti, a creeper and a cat', defs, body, still)
}
