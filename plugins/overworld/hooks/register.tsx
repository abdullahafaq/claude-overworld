// Entry point. Claude Code loads this module and calls `register(on)` once per session.
//
// What hangs off it:
//   session.start  → spawn back into the biome you used last (Sakura Night on a fresh install)
//   command.run    → /overworld and everything after it
//   ui.render      → paint the biome's scene behind the conversation
//   party.tsx      → everything to do with the Party pane
//
// Stored on disk, and nothing else: your biome, your motion choice, and whether you closed the Party.

import type { Register, ThemeSetArgs } from 'claude-code'

import { BIOMES, DEFAULT_BIOME, findBiome, paletteOf, type Biome } from './biomes'
import { makeColors } from './make-colors.js'
import { hideParty, registerParty, setPartyAccent, showParty } from './party'

const COMMAND = 'overworld'
const BIOME_KEY = 'biome'
const MOTION_KEY = 'motion'
/** Added to a scene's name when motion is off, so the backdrop draws the still version. */
const STILL = '-still'

const HELP = [
  '/overworld              list the biomes',
  '/overworld <biome>      switch, e.g. /overworld ocean',
  '/overworld random       let the world pick',
  '/overworld still        keep the biome, stop the motion (/overworld moving brings it back)',
  '/overworld party off    hide the agents pane (/overworld party on brings it back)',
  '/overworld off          back to the normal look',
].join('\n')

/** Built once per biome the first time it's needed, then reused. */
const colours = new Map<string, ReturnType<typeof makeColors>>()
const scenes = new Map<string, string>()

function coloursOf(biome: Biome) {
  let made = colours.get(biome.id)
  if (!made) {
    made = makeColors(paletteOf(biome))
    colours.set(biome.id, made)
  }
  return made
}

function sceneName(biome: Biome, still: boolean): string {
  return `overworld-${biome.id}${still ? STILL : ''}`
}

function themeOf(biome: Biome, still: boolean): ThemeSetArgs {
  return {
    colors: coloursOf(biome).theme,
    backdrop: { scene: sceneName(biome, still), glass: { blur: 10, tint: biome.glass.tint, opacity: biome.glass.opacity } },
  }
}

/** The scene for a backdrop name, or undefined when it isn't one of ours. */
function sceneFor(name: string): string | undefined {
  if (!name.startsWith('overworld-')) return undefined
  const cached = scenes.get(name)
  if (cached) return cached
  const still = name.endsWith(STILL)
  const id = name.slice('overworld-'.length, still ? -STILL.length : undefined)
  const biome = BIOMES.find(b => b.id === id)
  if (!biome) return undefined
  const svg = biome.draw(still)
  scenes.set(name, svg)
  return svg
}

const NOT_HERE = "Saved. This window doesn't draw backdrops, so you'll see it next time you're in the desktop app."

export const register: Register = (on, options) => {
  registerParty(on, options)

  // $.theme.set is called inline in each hook on purpose: that way the validator lists exactly what we set.
  // A window that can't draw (the terminal, say) may throw instead of answering, hence the try blocks.

  on('session.start', async ($, e, next) => {
    await $.command.register({ name: COMMAND, description: 'Switch biome: /overworld to list, /overworld <biome>, /overworld still, /overworld party off' })
    const saved = String((await $.store.get(BIOME_KEY)) ?? '')
    const still = (await $.store.get(MOTION_KEY)) === 'off'
    const biome = saved === 'off' ? undefined : (findBiome(saved) ?? findBiome(DEFAULT_BIOME))

    if (biome) {
      setPartyAccent(paletteOf(biome).roles.accent)
      try {
        const set = await $.theme.set(themeOf(biome, still))
        if (!set.isDrawn) $.ui.status(set.reason)
      } catch {
        // No backdrops here. Fine: the pick is still remembered.
      }
    }
    return next(e)
  })

  on('command.run', { command: COMMAND }, async ($, e) => {
    const words = e.args.trim().toLowerCase().split(/\s+/).filter(Boolean)
    const first = words[0] ?? ''

    if (!first || first === 'list' || first === 'help') {
      const current = String((await $.store.get(BIOME_KEY)) ?? DEFAULT_BIOME)
      const rows = BIOMES.map(b => `${b.id === current ? '▶' : ' '} ${b.title.padEnd(13)} /overworld ${b.id.padEnd(7)} ${b.blurb}`)
      return { text: `Overworld biomes:\n${rows.join('\n')}\n\n${HELP}` }
    }

    if (first === 'party') {
      if (words[1] === 'off' || words[1] === 'hide') {
        await hideParty($)
        return { text: 'Party pane hidden. /overworld party on brings it back.' }
      }
      await showParty($)
      return { text: 'Party pane is open. Agents spawn there as mobs.' }
    }

    if (first === 'off') {
      await $.store.set(BIOME_KEY, 'off')
      setPartyAccent(undefined)
      try {
        await $.theme.clear()
      } catch {
        // Nothing was drawn here anyway.
      }
      return { text: 'Back to the normal look. /overworld <biome> whenever you want to spawn back in.' }
    }

    const motionWord = first === 'still' || (first === 'motion' && words[1] === 'off') ? 'off'
      : first === 'moving' || (first === 'motion' && words[1] === 'on') ? 'on' : undefined
    const saved = String((await $.store.get(BIOME_KEY)) ?? DEFAULT_BIOME)

    let biome: Biome | undefined
    if (motionWord) {
      await $.store.set(MOTION_KEY, motionWord)
      biome = findBiome(saved) ?? findBiome(DEFAULT_BIOME)
    } else if (first === 'random') {
      const others = BIOMES.filter(b => b.id !== saved)
      biome = others[Math.floor(Math.random() * others.length)]
    } else {
      biome = findBiome(words.join(' '))
      if (!biome) return { text: `No biome called "${words.join(' ')}". Try one of: ${BIOMES.map(b => b.id).join(', ')}.` }
    }
    if (!biome) return { text: HELP }

    const still = (await $.store.get(MOTION_KEY)) === 'off'
    await $.store.set(BIOME_KEY, biome.id)
    setPartyAccent(paletteOf(biome).roles.accent)
    try {
      const set = await $.theme.set(themeOf(biome, still))
      if (!set.isDrawn) return { text: NOT_HERE }
    } catch {
      return { text: NOT_HERE }
    }
    if (motionWord) return { text: motionWord === 'off' ? `${biome.title}, holding still.` : `${biome.title}, moving again.` }
    return { text: `Spawned in ${biome.title}. ${biome.blurb}` }
  }).catch(() => ({ text: 'Something went wrong switching biomes. Nothing changed.' }))

  // Draw our scene behind the chat. Any other plugin's backdrop, and every other surface, is left alone.
  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') return next(e)
    if (e.props.plugin !== 'overworld') return next(e)
    const name = e.props.scene
    const source = sceneFor(name)
    if (!source) return next(e)
    const biome = BIOMES.find(b => name.startsWith(`overworld-${b.id}`))
    const { Svg } = $.ui.resolve(e)
    return <Svg source={source} alt={biome ? `${biome.title} scene` : 'Overworld scene'} isInteractive />
  })
}
