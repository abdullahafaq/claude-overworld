// The biome registry. /overworld, the README art and the website all read from this list.
// New biome = an entry here + a palette (palettes.ts) + a scene (scenes/<id>.ts).

import { PALETTES, type BiomeId } from './palettes'
import { aurora } from './scenes/aurora'
import { deep } from './scenes/deep'
import { desert } from './scenes/desert'
import { end } from './scenes/end'
import { meadow } from './scenes/meadow'
import { nether } from './scenes/nether'
import { ocean } from './scenes/ocean'
import { sakura } from './scenes/sakura'

export type Biome = {
  id: BiomeId
  title: string
  /** One line for /overworld, the README and the site. */
  blurb: string
  /** The glass over the scene, behind the chat. */
  glass: { tint: string; opacity: number }
  draw: (still: boolean) => string
}

export const BIOMES: readonly Biome[] = [
  { id: 'sakura', title: 'Sakura Night', blurb: 'Pink · dark. Cherry trees under a pink moon, lanterns and drifting petals.', glass: { tint: '#150f14', opacity: 0.56 }, draw: sakura },
  { id: 'meadow', title: 'Meadow', blurb: 'Green · light. A sunny morning in the plains, for the light mode people.', glass: { tint: '#f2f6f0', opacity: 0.62 }, draw: meadow },
  { id: 'desert', title: 'Desert Night', blurb: 'Gold · dark. Stars over the dunes, a temple, and a creeper near a cat.', glass: { tint: '#14110b', opacity: 0.56 }, draw: desert },
  { id: 'aurora', title: 'Aurora', blurb: 'Mint · dark. Northern lights over the snowy taiga.', glass: { tint: '#0b1014', opacity: 0.56 }, draw: aurora },
  { id: 'ocean', title: 'Ocean', blurb: 'Blue · dark. Sunbeams on the sea floor, a shipwreck and a glow squid.', glass: { tint: '#08111f', opacity: 0.56 }, draw: ocean },
  { id: 'end', title: 'The End', blurb: 'Violet · dark. End cities, crystal pillars and a dragon passing over.', glass: { tint: '#0e0b16', opacity: 0.56 }, draw: end },
  { id: 'nether', title: 'Nether', blurb: 'Red · dark. A fortress bridge over lava, crimson fungi and a ghast.', glass: { tint: '#150c0b', opacity: 0.56 }, draw: nether },
  { id: 'deep', title: 'Deep Dark', blurb: 'Black · dark. An ancient city, soul lanterns and the warden. Shh.', glass: { tint: '#0a0b0c', opacity: 0.6 }, draw: deep },
]

export const DEFAULT_BIOME: BiomeId = 'sakura'

/** Finds a biome by id, by its title, or by a close enough word ("deep dark", "End"). */
export function findBiome(word: string): Biome | undefined {
  const w = word.trim().toLowerCase().replace(/^the\s+/, '')
  if (!w) return undefined
  return BIOMES.find(b => b.id === w || b.title.toLowerCase().replace(/^the\s+/, '') === w || b.title.toLowerCase().startsWith(w))
}

export function paletteOf(biome: Biome) {
  return PALETTES[biome.id]
}
