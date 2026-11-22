// Scenery. Each function returns an SVG fragment, positioned by its left edge (x) and the ground it sits on.

import { Defs, hash, light, rect } from './pixels'

/** A blocky tree: trunk, a big leaf block with a lighter cap, and a few leaf pixels so it isn't flat. */
export function tree(x: number, ground: number, scale: number, trunk: string, leaf: string, leafTop: string): string {
  const s = scale
  let speckles = ''
  for (let i = 0; i < 14; i += 1) {
    const px = x + Math.floor(hash(x, i) * 9) * 10 * s
    const py = ground - 184 * s + Math.floor(hash(i, x) * 8) * 10 * s
    speckles += rect(px, py, 10 * s, 10 * s, i % 2 ? leafTop : trunk, i % 2 ? 'opacity="0.55"' : 'opacity="0.18"')
  }
  return rect(x + 40 * s, ground - 96 * s, 20 * s, 96 * s, trunk) +
    rect(x, ground - 184 * s, 100 * s, 96 * s, leaf) +
    rect(x + 14 * s, ground - 204 * s, 72 * s, 24 * s, leafTop) +
    speckles +
    rect(x + 8 * s, ground - 100 * s, 22 * s, 14 * s, leaf) +
    rect(x + 74 * s, ground - 108 * s, 18 * s, 12 * s, leaf)
}

/** A spruce: stacked tiers, optionally with snow on each. */
export function spruce(x: number, ground: number, h: number, colour: string, snow = ''): string {
  const tiers: Array<[number, number, number]> = [[0, 0.72, 64], [8, 0.92, 48], [18, 1.1, 28]]
  let out = rect(x + 26, ground - h, 12, h, colour)
  for (const [dx, up, w] of tiers) {
    out += rect(x + dx, ground - h * up, w, h * 0.24, colour)
    if (snow) out += rect(x + dx, ground - h * up, w, 6, snow)
  }
  return out
}

/** A paper lantern on a string. It sways, and its glow breathes. */
export function lantern(defs: Defs, x: number, top: number, len: number, delay: number): string {
  const y = top + len
  return `<g class="sway" style="animation-delay:-${delay}s">` +
    rect(x + 7, top, 2, len, '#4a3036') +
    light(defs, x + 8, y + 10, 52, '#ffb46a', 0.45, 'breathe') +
    rect(x, y, 16, 20, '#ffb46a') + rect(x, y, 16, 3, '#c4603a') + rect(x, y + 17, 16, 3, '#c4603a') +
    '</g>'
}

/** A cactus with two arms. */
export function cactus(x: number, ground: number, h: number, colour: string): string {
  return rect(x, ground - h, 24, h, colour) +
    rect(x - 22, ground - h * 0.62, 22, 12, colour) + rect(x - 22, ground - h * 0.82, 12, 32, colour) +
    rect(x + 24, ground - h * 0.48, 18, 12, colour) + rect(x + 30, ground - h * 0.66, 12, 28, colour)
}

/** A stepped pyramid, the desert's temple, centred on `cx`. */
export function pyramid(cx: number, ground: number, base: number, steps: number, colour: string, shade: string): string {
  let out = ''
  const stepH = 34
  for (let i = 0; i < steps; i += 1) {
    const w = base - i * (base / steps)
    const y = ground - (i + 1) * stepH
    out += rect(cx - w / 2, y, w, stepH, colour) + rect(cx - w / 2, y, 6, stepH, shade)
  }
  return out + rect(cx - 22, ground - 44, 44, 44, '#120c08')
}

/** A candle with a small flame that flickers. */
export function candle(defs: Defs, x: number, ground: number, delay: number): string {
  return rect(x, ground - 16, 6, 16, '#d8c8a0') +
    `<g class="pulse" style="animation-delay:-${delay}s">${light(defs, x + 3, ground - 22, 22, '#ffd27a', 0.7)}${rect(x + 1, ground - 24, 4, 7, '#ffd27a')}</g>`
}

/** A soul lantern on a chain: cold blue light for the Deep Dark. */
export function soulLantern(defs: Defs, x: number, top: number, len: number, delay: number): string {
  const y = top + len
  return rect(x + 6, top, 2, len, '#2c3438') +
    `<g class="breathe" style="animation-delay:-${delay}s">${light(defs, x + 7, y + 9, 70, '#7ad8ff', 0.4)}</g>` +
    rect(x, y, 14, 18, '#7ad8ff') + rect(x, y, 14, 4, '#2c3438') + rect(x, y + 14, 14, 4, '#2c3438')
}

/** Kelp that sways in the current. */
export function kelp(x: number, ground: number, h: number, delay: number): string {
  let out = ''
  for (let y = 0; y < h; y += 24) out += rect(x + (Math.floor(y / 24) % 2) * 6, ground - y - 24, 12, 24, y % 48 ? '#2f7a5a' : '#28694d')
  return `<g class="sway" style="animation-delay:-${delay}s">${out}</g>`
}

/** A little coral cluster. */
export function coral(x: number, ground: number, colour: string, tip: string): string {
  return rect(x, ground - 30, 14, 30, colour) + rect(x + 18, ground - 46, 14, 46, colour) + rect(x + 36, ground - 24, 14, 24, colour) +
    rect(x + 18, ground - 52, 14, 8, tip) + rect(x, ground - 36, 14, 8, tip)
}

/** A school of fish swimming across, wrapping around forever. */
export function fish(x: number, y: number, count: number, colour: string, seed: number): string {
  let out = ''
  for (let i = 0; i < count; i += 1) {
    const fx = x + hash(seed, i) * 140
    const fy = y + hash(seed, i + 9) * 60
    out += rect(fx, fy, 22, 10, colour) + rect(fx - 8, fy + 1, 8, 8, colour) + rect(fx + 16, fy + 2, 3, 3, '#14202e')
  }
  return `<g class="drift" style="animation-delay:-${(seed % 50).toFixed(0)}s">${out}<g transform="translate(1600 0)">${out}</g></g>`
}

/** A crimson fungus, the Nether's trees, with glowing shroomlights. */
export function fungus(defs: Defs, x: number, ground: number, h: number, cap: string): string {
  return rect(x, ground - h, 18, h, '#6a2434') +
    rect(x - 46, ground - h - 56, 110, 58, cap) + rect(x - 28, ground - h - 74, 74, 20, cap) +
    `<g class="pulse">${light(defs, x - 18, ground - h - 26, 26, '#ffb860', 0.7)}${light(defs, x + 40, ground - h - 40, 26, '#ffb860', 0.7)}</g>` +
    rect(x - 24, ground - h - 32, 12, 12, '#ffb860') + rect(x + 34, ground - h - 46, 12, 12, '#ffb860')
}

/** A chorus plant from the End: branching purple stalks with pale flowers. */
export function chorus(x: number, ground: number, h: number): string {
  const stalk = '#6e4f80'
  const flower = '#d0aef0'
  return rect(x, ground - h, 12, h, stalk) +
    rect(x - 26, ground - h * 0.68, 26, 12, stalk) + rect(x - 26, ground - h * 0.68 - 28, 12, 28, stalk) +
    rect(x + 12, ground - h * 0.48, 24, 12, stalk) + rect(x + 24, ground - h * 0.48 - 24, 12, 24, stalk) +
    rect(x - 4, ground - h - 16, 20, 18, flower) + rect(x - 30, ground - h * 0.68 - 44, 20, 16, flower) + rect(x + 20, ground - h * 0.48 - 40, 20, 16, flower)
}

/** A small house with a stepped roof, for the Meadow. */
export function house(x: number, ground: number): string {
  return rect(x, ground - 96, 124, 96, '#c9a06a') + rect(x, ground - 96, 124, 6, '#b08a58') +
    rect(x - 12, ground - 118, 148, 22, '#8a4a32') + rect(x + 4, ground - 138, 116, 20, '#8a4a32') + rect(x + 22, ground - 156, 80, 18, '#8a4a32') +
    rect(x + 50, ground - 52, 26, 52, '#6b4a2e') + rect(x + 14, ground - 74, 22, 18, '#bfe0f0') + rect(x + 88, ground - 74, 22, 18, '#bfe0f0')
}

/** An igloo: a stepped dome of snow blocks. */
export function igloo(cx: number, ground: number): string {
  const widths = [170, 150, 118, 72]
  let out = ''
  widths.forEach((w, i) => { out += rect(cx - w / 2, ground - (i + 1) * 20, w, 20, i % 2 ? '#d4e0ec' : '#e4edf5') })
  return out + rect(cx - 16, ground - 34, 32, 34, '#1a2430')
}
