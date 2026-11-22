// Drawing helpers shared by every scene.
//
// Pixel art lives in the code as rows of letters (one letter = one pixel, '.' = nothing), and this file
// turns those rows into SVG paths, one path per colour, so a whole mob costs a handful of elements.
// Also here: blocky hills, scattered specks, soft lights, the motion classes, and the <svg> wrapper.
// Pure string building. No network, no files.

export const WIDTH = 1600
export const HEIGHT = 1000

/** The mobs' spot: right of the conversation column and left of the side panel, clear of any text. */
export const GROUND = 862
export const MOB_LEFT = 1096

export type Paint = Record<string, string>

/** Deterministic noise in 0..1 for a (seed, index) pair, so a scene is laid out the same on every draw. Mulberry32. */
export function hash(seed: number, index: number): number {
  let t = (seed * 2654435761 + index * 40503 + 0x6d2b79f5) >>> 0
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

export function rect(x: number, y: number, w: number, h: number, fill: string, extra = ''): string {
  return `<rect x="${round(x)}" y="${round(y)}" width="${round(w)}" height="${round(h)}" fill="${fill}"${extra ? ' ' + extra : ''}/>`
}

/** Pixel art from a text map: one letter a pixel, '.' empty. Every pixel of a colour shares one path. */
export function pixels(rows: readonly string[], left: number, top: number, cell: number, paint: Paint, only?: (kind: string) => boolean): string {
  const byKind = new Map<string, string>()
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x += 1) {
      const kind = row[x] ?? '.'
      if (kind === '.' || (only && !only(kind))) continue
      byKind.set(kind, (byKind.get(kind) ?? '') + `M${round(left + x * cell)} ${round(top + y * cell)}h${cell}v${cell}h-${cell}z`)
    }
  })
  let out = ''
  for (const [kind, d] of byKind) {
    const colour = paint[kind]
    if (colour) out += `<path d="${d}" fill="${colour}"/>`
  }
  return out
}

/** Blocky hills: a stepped skyline from a list of heights, measured up from `base`. */
export function ridge(heights: readonly number[], fill: string, base = HEIGHT, extra = ''): string {
  const step = WIDTH / heights.length
  let d = `M0 ${base}`
  heights.forEach((h, i) => { d += `V${round(base - h)}H${round((i + 1) * step)}` })
  return `<path d="${d}V${base}Z" fill="${fill}"${extra ? ' ' + extra : ''}/>`
}

/** The same thing hanging from the top, for cave ceilings. */
export function ceiling(heights: readonly number[], fill: string): string {
  const step = WIDTH / heights.length
  let d = 'M0 0'
  heights.forEach((h, i) => { d += `V${round(h)}H${round((i + 1) * step)}` })
  return `<path d="${d}V0Z" fill="${fill}"/>`
}

/** Heights that wander but snap to a block grid, from a seed. */
export function heights(count: number, base: number, spread: number, seed: number, block = 16): number[] {
  return Array.from({ length: count }, (_, i) => base + Math.round((hash(seed, i) * spread) / block) * block)
}

/** Little square specks (stars, dust, snow), scattered from a seed inside a box. */
export function specks(count: number, box: { x: number; y: number; w: number; h: number }, seed: number, fill: string, size: number, cls = ''): string {
  let out = ''
  for (let i = 0; i < count; i += 1) {
    const x = box.x + hash(seed, i * 2) * box.w
    const y = box.y + hash(seed, i * 2 + 1) * box.h
    const delay = (hash(seed + 7, i) * 6).toFixed(1)
    out += rect(x, y, size, size, fill, cls ? `class="${cls}" style="animation-delay:-${delay}s"` : '')
  }
  return out
}

/** Collects gradients so each scene can ask for soft light without juggling ids. */
export class Defs {
  private parts: string[] = []
  private count = 0

  /** A radial glow: a colour fading to nothing. Returns a fill to use. */
  glow(colour: string, strength = 1): string {
    const id = `g${this.count++}`
    this.parts.push(`<radialGradient id="${id}"><stop offset="0" stop-color="${colour}" stop-opacity="${strength}"/><stop offset="1" stop-color="${colour}" stop-opacity="0"/></radialGradient>`)
    return `url(#${id})`
  }

  /** A top-to-bottom gradient through the given stops. */
  vertical(stops: ReadonlyArray<readonly [number, string]>): string {
    const id = `v${this.count++}`
    this.parts.push(`<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`)
    return `url(#${id})`
  }

  /** A left-to-right gradient, for aurora bands and light beams. */
  horizontal(stops: ReadonlyArray<readonly [number, string, number?]>): string {
    const id = `h${this.count++}`
    this.parts.push(`<linearGradient id="${id}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a ?? 1}"/>`).join('')}</linearGradient>`)
    return `url(#${id})`
  }

  toString(): string {
    return this.parts.join('')
  }
}

/** A soft round light at a point. */
export function light(defs: Defs, x: number, y: number, r: number, colour: string, strength = 1, cls = ''): string {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${defs.glow(colour, strength)}"${cls ? ` class="${cls}"` : ''}/>`
}

// Motion classes. They use steps() so things move in chunky frames, which suits the art and is cheap to
// draw. Rules for anything added here: a full cycle takes 1s or longer, and the element's plain (unanimated)
// state must look right, because that's what reduce-motion shows.
export const MOTION = `
.bob{animation:ow-bob 2.6s steps(1,end) infinite}
.hover{animation:ow-hover 3.2s steps(1,end) infinite}
.blink{animation:ow-blink 6s steps(1,end) infinite}
.stepA{animation:ow-stepA 1.4s steps(1,end) infinite}
.stepB{opacity:0;animation:ow-stepB 1.4s steps(1,end) infinite}
.twinkle{animation:ow-twinkle 4s steps(4,end) infinite}
.pulse{animation:ow-pulse 3.2s steps(12,end) infinite}
.breathe{animation:ow-breathe 6s steps(24,end) infinite}
.sway{animation:ow-sway 4.8s steps(16,end) infinite}
.fall{animation:ow-fall 12s steps(96,end) infinite}
.rise{animation:ow-rise 10s steps(80,end) infinite}
.drift{animation:ow-drift 60s steps(480,end) infinite}
.glide{animation:ow-glide 40s steps(320,end) infinite}
.shimmer{animation:ow-shimmer 3s steps(6,end) infinite}
.flow{animation:ow-flow 2s steps(8,end) infinite}
@keyframes ow-bob{0%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes ow-hover{0%{transform:translateY(0)}25%{transform:translateY(-4px)}50%{transform:translateY(-8px)}75%{transform:translateY(-4px)}}
@keyframes ow-blink{0%{opacity:1}96%{opacity:0}98%{opacity:1}}
@keyframes ow-stepA{0%{opacity:1}50%{opacity:0}}
@keyframes ow-stepB{0%{opacity:0}50%{opacity:1}}
@keyframes ow-twinkle{0%,100%{opacity:.35}50%{opacity:1}}
@keyframes ow-pulse{0%,100%{opacity:.35}50%{opacity:1}}
@keyframes ow-breathe{0%,100%{opacity:.7}50%{opacity:1}}
@keyframes ow-sway{0%,100%{transform:translateX(-5px)}50%{transform:translateX(5px)}}
@keyframes ow-fall{0%{transform:translate(0,-80px);opacity:0}8%{opacity:1}90%{opacity:1}100%{transform:translate(-160px,820px);opacity:0}}
@keyframes ow-rise{0%{transform:translate(0,0);opacity:0}10%{opacity:1}90%{opacity:.8}100%{transform:translate(30px,-420px);opacity:0}}
@keyframes ow-drift{0%{transform:translateX(0)}100%{transform:translateX(-1600px)}}
@keyframes ow-glide{0%{transform:translateX(-500px)}100%{transform:translateX(2100px)}}
@keyframes ow-shimmer{0%,100%{opacity:.7;transform:scaleX(1)}50%{opacity:.35;transform:scaleX(1.3)}}
@keyframes ow-flow{0%{transform:translateY(0)}100%{transform:translateY(32px)}}
.shimmer{transform-box:fill-box;transform-origin:center}
@media (prefers-reduced-motion:reduce){*{animation:none!important}.stepB{opacity:0}}
`

/** The one SVG wrapper every scene uses. `title` is what a screen reader hears. */
export function svg(title: string, defs: Defs, body: string, still = false): string {
  const style = still ? `${MOTION}*{animation:none!important}` : MOTION
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${title}"><title>${title}</title><style>${style}</style><defs>${defs}</defs>${body}</svg>`
}

function round(n: number): number {
  return Math.round(n * 10) / 10
}
