// Deep Dark: the quietest place in the world. An ancient city in the dark, soul lanterns, candles,
// sculk creeping across the floor, and the warden, whose heart you can see beating. Shh.

import { mob } from '../mobs'
import { Defs, GROUND, HEIGHT, MOB_LEFT, WIDTH, ceiling, heights, light, rect, specks, svg, terrain } from '../pixels'
import { candle, soulLantern } from '../props'

function city(): string {
  const stone = '#1a2024'
  const dark = '#050607'
  return rect(440, 300, 76, GROUND - 300, stone) + rect(820, 300, 76, GROUND - 300, stone) + rect(410, 244, 516, 64, stone) +
    rect(516, 308, 304, GROUND - 308, dark) +
    rect(452, 330, 52, 6, '#0f1416') + rect(452, 440, 52, 6, '#0f1416') + rect(832, 330, 52, 6, '#0f1416') + rect(832, 440, 52, 6, '#0f1416') +
    rect(250, 430, 70, GROUND - 430, '#141a1d') + rect(1360, 390, 80, GROUND - 390, '#141a1d') + rect(1346, 366, 108, 26, stone)
}

function sculk(defs: Defs): string {
  const veins = [[380, 260], [900, 330], [1500, 100]]
  let out = ''
  veins.forEach(([x, w], i) => {
    out += rect(x!, GROUND - 6, w!, 8, '#0f3a40')
    out += `<g class="pulse" style="animation-delay:-${i * 1.1}s">${rect(x! + 40, GROUND - 16, 6, 12, '#5fd3c8')}${rect(x! + w! - 60, GROUND - 12, 6, 8, '#5fd3c8')}${light(defs, x! + w! / 2, GROUND, 90, '#5fd3c8', 0.2)}</g>`
  })
  return out
}

export function deep(still = false): string {
  const defs = new Defs()
  const shrieker = rect(1290, GROUND - 32, 40, 32, '#d8d2b8') + rect(1296, GROUND - 40, 8, 8, '#d8d2b8') + rect(1316, GROUND - 40, 8, 8, '#d8d2b8') + rect(1298, GROUND - 22, 24, 6, '#0f3a40')
  const motes = `<g opacity="0.55">${specks(16, { x: 900, y: 420, w: 500, h: 380 }, 91, '#5fd3c8', 4, 'rise')}</g>`

  const body =
    rect(0, 0, WIDTH, HEIGHT, '#08090a') +
    ceiling(heights(25, 110, 130, 61), '#121516') +
    light(defs, 668, 560, 260, '#5fd3c8', 0.08) +
    city() +
    soulLantern(defs, 470, 308, 44, 0) + soulLantern(defs, 852, 308, 70, 1.4) + soulLantern(defs, 1390, 392, 56, 2.6) +
    terrain(defs, { top: '#1e2529', topDark: '#151b1e', soil: '#0f1213', specks: ['#14181a', '#0b0e0f', '#191d20'] }, 61) +
    sculk(defs) + shrieker +
    candle(defs, 580, GROUND, 0) + candle(defs, 620, GROUND, 0.8) + candle(defs, 740, GROUND, 1.7) +
    `<g class="pulse" style="animation-duration:2.4s">${light(defs, MOB_LEFT + 84, GROUND - 74, 110, '#4fe3d6', 0.3)}</g>` +
    motes +
    mob('warden', MOB_LEFT + 36, GROUND, 6, 0)

  return svg('Deep Dark: an ancient city lit by soul lanterns and candles, sculk on the floor and the warden standing in the dark', defs, body, still)
}
