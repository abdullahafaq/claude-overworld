# Contributing to Overworld

Bug reports, readability complaints, new mobs and whole new biomes are all very welcome.

## Setup

Node 23.6 or newer plus the Claude Code CLI. No `npm install`: the scripts run the TypeScript directly.

```bash
npm run verify
```

`verify` = `check:biomes` (contrast, motion, scene safety) + `npm test` (`claude plugin validate` and the plugin's own tests). Keep it passing.

## Running your copy

In Claude Code, open the repo and ask it to use this folder for the `overworld` plugin instead of the installed one. After an edit: `/reload-plugins`, then `/overworld <biome>`.

## Adding a biome

Think of it as a crafting recipe:

- **Palette** in `plugins/overworld/hooks/palettes.ts`. Primary text needs 13:1 on every surface, everything else 6:1. `npm run check:biomes` measures it.
- **Scene** in `plugins/overworld/hooks/scenes/<id>.ts`, returning `svg(title, defs, body, still)`. Use the helpers in `pixels.ts` and `props.ts`. Mobs go at `MOB_LEFT` on `GROUND`; keep the centre of the frame quiet, since that's where the conversation sits.
- **Entry** in `plugins/overworld/hooks/biomes.ts`: title, one-line blurb, glass tint.
- **Art**: `npm run art` re-renders the trailer, the README previews and the site's images.
- **Docs**: a line in the README's biome list and the CHANGELOG.

## Scene rules

These scenes sit next to someone's work all day:

- Motion is slow: use the classes in `pixels.ts` (`bob`, `sway`, `pulse`, `fall`, …), and no loop under one second. No flashing.
- The unanimated state is what reduce-motion users see, so it has to look complete.
- Vector only. No `<image>`, scripts, links, fonts or remote URLs, and comments in plain words. The checks reject anything else.
- Your own pixels. Inspired-by is the whole point; copied sprites, textures or logos from a game can't be merged.

## Pull requests

Small and focused is best. Say what changed and why, and attach a screenshot for anything visual (and how you checked readability or motion, if it touches those).
