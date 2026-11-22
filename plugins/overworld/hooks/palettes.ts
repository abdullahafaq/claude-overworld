// Palettes. One per biome, and each one is only a dozen colours:
//   s0..s3   the surfaces, darkest (page) to lightest (menus)
//   primary / secondary / muted   the three text shades
//   roles    accent, danger, success, warning, pro
// Claude Code's makeColors fills in the rest of the app from these.
//
// The rule I hold every palette to: primary text 13:1 or more against every surface, the other shades and
// the accent 6:1 or more. `npm run check:biomes` fails the moment one slips.

type Roles = { accent: string; danger: string; success: string; warning: string; pro: string }
type Shades = readonly [s0: string, s1: string, s2: string, s3: string, primary: string, secondary: string, muted: string]

export type Palette = {
  label: string
  only: 'dark' | 'light'
  roles: Roles
  codeTheme?: { dark?: string; light?: string }
  dark?: { gray: { anchors: Anchors } }
  light?: { gray: { anchors: Anchors } }
}

type Anchors = Record<'surface-0' | 'surface-1' | 'surface-2' | 'surface-3' | 'text-primary' | 'text-secondary' | 'text-muted', string>

function anchors([s0, s1, s2, s3, primary, secondary, muted]: Shades): Anchors {
  return { 'surface-0': s0, 'surface-1': s1, 'surface-2': s2, 'surface-3': s3, 'text-primary': primary, 'text-secondary': secondary, 'text-muted': muted }
}

function dark(label: string, roles: Roles, shades: Shades, code?: string): Palette {
  return { label, only: 'dark', roles, ...(code && { codeTheme: { dark: code } }), dark: { gray: { anchors: anchors(shades) } } }
}

function light(label: string, roles: Roles, shades: Shades): Palette {
  return { label, only: 'light', roles, light: { gray: { anchors: anchors(shades) } } }
}

export const PALETTES = {
  sakura: dark('Sakura Night',
    { accent: '#f4a0c0', danger: '#ff8a8a', success: '#9ed6a6', warning: '#f2c27a', pro: '#c7a6ff' },
    ['#150f14', '#1c141a', '#241a21', '#2a1f27', '#f6eaf0', '#d6c3cd', '#b39fab']),
  meadow: light('Meadow',
    { accent: '#1f5e35', danger: '#9c2c24', success: '#1f5e35', warning: '#8a5a00', pro: '#5b4a9b' },
    ['#eef3ec', '#f5f8f3', '#ffffff', '#ffffff', '#17211a', '#3a4a3e', '#4b5a50']),
  desert: dark('Desert Night',
    { accent: '#f0c060', danger: '#ff8a8a', success: '#9ed6a6', warning: '#f0a860', pro: '#c7a6ff' },
    ['#14110b', '#1b170f', '#231e14', '#29231a', '#f5ecd9', '#d8cbb0', '#b5a88c']),
  aurora: dark('Aurora',
    { accent: '#8fe8c0', danger: '#ff8a8a', success: '#a6e08a', warning: '#f2c27a', pro: '#b9a6ff' },
    ['#0b1014', '#10171c', '#162026', '#1b262d', '#e8f3f2', '#c0d4d2', '#9db5b3'], 'nord'),
  ocean: dark('Ocean',
    { accent: '#7ab8ff', danger: '#ff8a8a', success: '#8fd6a2', warning: '#f2c27a', pro: '#c7a6ff' },
    ['#08111f', '#0d1828', '#122033', '#16263b', '#e8f0fa', '#bfcde0', '#9db0c8']),
  end: dark('The End',
    { accent: '#c7aaff', danger: '#f08a9a', success: '#9ed6a6', warning: '#e8d890', pro: '#f0a8e0' },
    ['#0e0b16', '#14101f', '#1a1528', '#1f192f', '#eeeaf7', '#c7bfdc', '#a59cbf']),
  nether: dark('Nether',
    { accent: '#ffa27a', danger: '#ff8a8a', success: '#9ed69a', warning: '#ffd27a', pro: '#c7a6ff' },
    ['#150c0b', '#1d1110', '#251715', '#2b1b18', '#f3e9e6', '#d3c2bd', '#b5a099']),
  deep: dark('Deep Dark',
    { accent: '#5fd3c8', danger: '#f08a8a', success: '#8fd6a2', warning: '#e8c87a', pro: '#a8b8ff' },
    ['#0a0b0c', '#101213', '#16191b', '#1b1f21', '#e8ecec', '#bcc4c5', '#99a3a5'], 'github-dark'),
} as const satisfies Record<string, Palette>

export type BiomeId = keyof typeof PALETTES
