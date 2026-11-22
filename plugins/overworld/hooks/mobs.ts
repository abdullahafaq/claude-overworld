// Mob sprites. All drawn by me, one letter per pixel ('.' is see-through), mostly in side view facing right.
//
// Each mob can bob (or hover), blink (pixels marked 'E' flick to `skin`), and, if it has `legs`, alternate
// between its standing legs and a mid-step pose. To make a new one: add an entry with rows and a paint map.

import { pixels, type Paint } from './pixels'

export type Mob = {
  /** What a screen reader hears for this mob. */
  name: string
  rows: readonly string[]
  paint: Paint
  /** The colour eyes blink back to. */
  skin: string
  /** How many rows at the bottom are legs, and what they look like mid-step. */
  legs?: { count: number; step: readonly string[] }
  /** Floaters hover instead of standing. */
  floats?: boolean
}

export const MOBS = {
  fox: {
    name: 'a fox',
    rows: [
      '...........O.O..',
      '..........OOOOO.',
      '..........OEOOOO',
      'WO........OOOWWK',
      'WOO.OOOOOOOOWWW.',
      '.OOOOOOOOOOOW...',
      '..OOOOOOOOOOW...',
      '..ooooooooooo...',
      '...KK....KK.....',
      '...KK....KK.....',
    ],
    paint: { O: '#e3772c', o: '#bf5e20', W: '#f5efe6', K: '#2a1e18', E: '#1a1a1a' },
    skin: '#e3772c',
    legs: { count: 2, step: ['..KK......KK....', '..KK......KK....'] },
  },
  snowfox: {
    name: 'a snow fox',
    rows: [
      '...........W.W..',
      '..........WWWWW.',
      '..........WEWWWW',
      'WW........WWWwwK',
      'WWW.WWWWWWWWwww.',
      '.WWWWWWWWWWWw...',
      '..WWWWWWWWWWw...',
      '..wwwwwwwwwww...',
      '...gg....gg.....',
      '...gg....gg.....',
    ],
    paint: { W: '#f4f6f8', w: '#c9d2dc', g: '#8a96a4', K: '#2a2a30', E: '#1a1a1a' },
    skin: '#f4f6f8',
    legs: { count: 2, step: ['..gg......gg....', '..gg......gg....'] },
  },
  parrot: {
    name: 'a parrot',
    rows: [
      '...RRR...',
      '..RRRRR..',
      '..RWERRY.',
      '..RRRRYY.',
      '..RRRRR..',
      '.RRRRRR..',
      '.RBBRRR..',
      '.RBBBRR..',
      '.RBBBRR..',
      '..BBBR...',
      '..RRB....',
      '..R.B....',
    ],
    paint: { R: '#e2382c', B: '#2f7ae0', Y: '#f2c230', W: '#ffffff', E: '#2a2a2a' },
    skin: '#e2382c',
    floats: true,
  },
  panda: {
    name: 'a panda',
    rows: [
      '..KK....KK..',
      '..KWWWWWWK..',
      '..WWWWWWWW..',
      '..WKKWWKKW..',
      '..WKEWWEKW..',
      '..WWWKKWWW..',
      '.KKWWWWWWKK.',
      'KKKWWWWWWKKK',
      'KKKwWWWWwKKK',
      '.KKwwwwwwKK.',
      '..KKK..KKK..',
    ],
    paint: { W: '#f2f2ee', w: '#cfcfc8', K: '#2a2a2e', E: '#f2f2ee' },
    skin: '#2a2a2e',
  },
  wolf: {
    name: 'a wolf',
    rows: [
      '...........W.W..',
      '..........WWWWW.',
      '..........WEWWWW',
      'W.........WWWwwK',
      '.WWWWWWWWRRWww..',
      '.WWWWWWWWWWW....',
      '.wWWWWWWWWWw....',
      '..ww.....ww.....',
      '..WW.....WW.....',
      '..ww.....ww.....',
    ],
    paint: { W: '#dcdcd6', w: '#a9a9a2', K: '#2a2a2a', R: '#c0392b', E: '#1a1a1a' },
    skin: '#dcdcd6',
    legs: { count: 3, step: ['.ww.......ww....', '.WW.......WW....', '.ww.......ww....'] },
  },
  bee: {
    name: 'a bee',
    rows: [
      '.....WWW....',
      '....WWwW....',
      '.YYKKYYKKYY.',
      'KYYKKYYKKYEY',
      'YyyKKyyKKYYY',
      '.yyKKyyKKyy.',
      '..K...K..K..',
    ],
    paint: { Y: '#f6c443', y: '#d9a52a', K: '#3b2a14', W: '#e3f2ff', w: '#b9d6f0', E: '#111111' },
    skin: '#f6c443',
    floats: true,
  },
  creeper: {
    name: 'a creeper',
    rows: [
      'GgGGgGGg',
      'gGGgGGGg',
      'GKKGgKKG',
      'GKKGGKKg',
      'gGGKKGGG',
      'GgKKKKgG',
      'GGKKKKGG',
      'GGKGGKGg',
      '..gGGG..',
      '..GGgG..',
      '..GgGG..',
      '..GGGg..',
      '..gGGG..',
      '..GgGG..',
      'GGg..gGG',
      'dGg..gGd',
    ],
    paint: { G: '#6fbf5a', g: '#4f9a44', d: '#3a6e33', K: '#18241a' },
    skin: '#6fbf5a',
    legs: { count: 2, step: ['.GGg..gGG', '.dGg..gGd'] },
  },
  axolotl: {
    name: 'an axolotl',
    rows: [
      '..........G..G',
      '...........PPG',
      'PP........PPPP',
      'PPPPPPPPPPPEPP',
      '.pPPPPPPPPPPPp',
      '...P..P...P...',
    ],
    paint: { P: '#f5a3c0', p: '#e07fa3', G: '#d0507a', E: '#2a1420' },
    skin: '#f5a3c0',
    legs: { count: 1, step: ['..P..P....P...'] },
  },
  frog: {
    name: 'a frog',
    rows: [
      '........WW..',
      '.......WEW..',
      'GGGGGGGGGGGG',
      'GGGgGGGGGGgG',
      'gGGGGGGGGGG.',
      '.gg....gg...',
      'gg....gg....',
    ],
    paint: { G: '#79b85a', g: '#558f3e', W: '#f0e8c0', E: '#1a1a1a' },
    skin: '#f0e8c0',
  },
  cat: {
    name: 'a cat',
    rows: [
      '..........O.O.',
      '..........OOOO',
      'O.........OEOO',
      'O..OOOOOOOOOOK',
      '.OOOoOoOoOOO..',
      '.OOOOOOOOOOO..',
      '..OO.....OO...',
      '..oo.....oo...',
    ],
    paint: { O: '#e0a050', o: '#b07a34', K: '#2a1e14', E: '#3fbf5a' },
    skin: '#e0a050',
    legs: { count: 2, step: ['.OO.......OO..', '.oo.......oo..'] },
  },
  enderman: {
    name: 'an enderman',
    rows: [
      '.KKKKKKKK.', '.KKKKKKKK.', '.KKKKKKKK.', '.KKKKKKKK.', '.KeEKKEeK.', '.KKKKKKKK.', '.KKKKKKKK.', '.kKKKKKKk.',
      'K..KKKK..K', 'K..KKKK..K', 'K..KKKK..K', 'K..KKKK..K', 'K..KKKK..K', 'K..KKKK..K',
      'K..K..K..K', 'K..K..K..K', 'K..K..K..K', 'K..K..K..K',
      '...K..K...', '...K..K...', '...K..K...', '...K..K...', '...K..K...', '...k..k...',
    ],
    paint: { K: '#2c2836', k: '#1c1924', E: '#e2a0ff', e: '#b56ee8' },
    skin: '#2c2836',
  },
  strider: {
    name: 'a strider',
    rows: [
      '.H.H.HH.H.H.',
      'RRRRRRRRRRRR',
      'RRRRRRRRRRRR',
      'RRWERRRRWERR',
      'RRRRRRRRRRRR',
      'RRRRrrrrRRRR',
      'rRRRRRRRRRRr',
      '..rr....rr..',
      '..RR....RR..',
      '..rr....rr..',
      '..RR....RR..',
      '..rr....rr..',
    ],
    paint: { R: '#b8453a', r: '#8a2f28', H: '#6a2a24', W: '#f0e0d0', E: '#1a0a0a' },
    skin: '#b8453a',
    legs: { count: 2, step: ['.RR......RR.', '.rr......rr.'] },
  },
  squid: {
    name: 'a glow squid',
    rows: [
      '..CCCCCC..',
      '.CLCCCCLC.',
      '.CCCCCCCC.',
      '.CCLCCLCC.',
      '.CECCCCEC.',
      '.CCCCCCCC.',
      '.cCCCCCCc.',
      '.c.c..c.c.',
      '.c.c..c.c.',
      'c..c..c..c',
      'c..c..c..c',
      '...c..c...',
    ],
    paint: { C: '#4fd8d0', c: '#2aa8a8', L: '#b8fff4', E: '#0d2a2a' },
    skin: '#4fd8d0',
    floats: true,
  },
  warden: {
    name: 'a warden',
    rows: [
      'T..............T',
      'TT.BBBBBBBBBB.TT',
      '.TTBBBBBBBBBBTT.',
      '...BBBBBBBBBB...',
      '...BBbBBBBbBB...',
      '...BBBBBBBBBB...',
      '..bbBBBBBBBBbb..',
      'BBBBBBBBBBBBBBBB',
      'BBBBSSBBBBSSBBBB',
      'BB.BBSSBBSSBB.BB',
      'BB.BBBSSSSBBB.BB',
      'BB.BBBBSSBBBB.BB',
      'BB.BBBBBBBBBB.BB',
      'bb.BBBBBBBBBB.bb',
      '...BBBBBBBBBB...',
      '...BBBB..BBBB...',
      '...BBBB..BBBB...',
      '...BBBB..BBBB...',
      '...BBBB..BBBB...',
      '...bbbb..bbbb...',
    ],
    paint: { B: '#1f3a48', b: '#152a35', T: '#4fe3d6', S: '#4fe3d6' },
    skin: '#1f3a48',
  },
  armadillo: {
    name: 'an armadillo',
    rows: [
      '....BBBBBB....',
      '..BBbBBbBBB...',
      '.BBBBBBBBBBHH.',
      'BBbBBbBBbBHEHH',
      'BBBBBBBBBBHHHP',
      '.bbbbbbbbbb...',
      '..LL.....LL...',
    ],
    paint: { B: '#c98a74', b: '#9a5e4c', H: '#e0a890', E: '#1a1a1a', P: '#d87a8a', L: '#7a4a3a' },
    skin: '#e0a890',
    legs: { count: 1, step: ['...LL....LL...'] },
  },
  magma: {
    name: 'a magma cube',
    rows: ['MMOMMOMM', 'MMMMMMMM', 'OYMMMMYO', 'MRYMMYRM', 'MMMMMMMM', 'MMOOOOMM', 'OMMMMMMO', 'MMMMOMMM'],
    paint: { M: '#4a271b', O: '#ff8a3a', Y: '#ffd36a', R: '#e0502a' },
    skin: '#4a271b',
  },
} as const satisfies Record<string, Mob>

export type MobName = keyof typeof MOBS

export function size(name: MobName, cell: number): { width: number; height: number } {
  const mob: Mob = MOBS[name]
  return { width: (mob.rows[0]?.length ?? 0) * cell, height: mob.rows.length * cell }
}

/**
 * A mob standing with its feet on `ground` (or hovering over it), ready to drop into a scene.
 * `delay` offsets its animations so two mobs side by side don't move in lockstep.
 */
export function mob(name: MobName, left: number, ground: number, cell: number, delay = 0): string {
  const m: Mob = MOBS[name]
  const top = ground - m.rows.length * cell
  const legRows = m.legs?.count ?? 0
  const bodyRows = m.rows.slice(0, m.rows.length - legRows)
  const restLegs = m.rows.slice(m.rows.length - legRows)
  const withoutEyes = bodyRows.map(row => row.replace(/E/g, '§'))
  const paint = { ...m.paint, '§': m.skin }
  const lag = `style="animation-delay:-${delay.toFixed(1)}s"`

  const body = pixels(withoutEyes, left, top, cell, paint)
  const eyes = `<g class="blink" style="animation-delay:-${(delay * 2.3).toFixed(1)}s">${pixels(bodyRows, left, top, cell, m.paint, kind => kind === 'E')}</g>`
  const legTop = top + bodyRows.length * cell
  const legs = m.legs
    ? `<g class="stepA" ${lag}>${pixels(restLegs, left, legTop, cell, m.paint)}</g><g class="stepB" ${lag}>${pixels(m.legs.step, left, legTop, cell, m.paint)}</g>`
    : ''

  return `<g class="${m.floats ? 'hover' : 'bob'}" ${lag}>${body}${eyes}${legs}</g>`
}

/** A small still portrait of a mob for the agents pane: its own tiny SVG, no motion. */
export function portrait(name: MobName, faded = false): string {
  const m: Mob = MOBS[name]
  const w = m.rows[0]?.length ?? 1
  const h = m.rows.length
  const side = Math.max(w, h)
  const left = (side - w) / 2
  const top = side - h
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${side} ${side}" shape-rendering="crispEdges"${faded ? ' opacity="0.45"' : ''}>${pixels(m.rows, left, top, 1, m.paint)}</svg>`
}
