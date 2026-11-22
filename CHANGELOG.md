# Changelog

All notable changes to Overworld. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/).

## [1.1.0] - 2026-11-22

### Added

- Two new biomes: **Jungle** (green, giant trees, vines, bamboo, a mossy temple) and **Badlands** (orange, striped mesas at sunset, an old mineshaft). Ten in total now.
- A new mob, the armadillo. It lives in the Badlands and joins the spares for custom agents.

### Changed

- Every scene got a quality pass: textured block ground with a ragged grass edge and tufts, hills with lit block tops and a speckle texture, and a soft vignette for depth.
- The Nether's accent is now crimson, so each biome keeps a colour of its own.
- The Party pane is named Party (Claude Code already has an Agents tab), and its cards no longer overflow on narrow panes.

## [1.0.0] - 2026-11-22

First release. Spawning in.

### Added

- Eight biomes at launch, each an animated pixel scene behind the chat plus a full app palette: Sakura Night, Meadow (light), Desert Night, Aurora, Ocean, The End, Nether and Deep Dark.
- `/overworld` to list and switch biomes, `random`, `still` / `moving`, `party on` / `party off` and `off`. Your choices are remembered across sessions.
- The Party: a pane where every subagent spawns in as a mob (fox, parrot, panda, wolf, creeper, bee, and five more for custom agents), with its task, live tool line, an XP bar, exact token count, a timer and a trail of recent tools. Secrets are masked before anything is stored.
- Fifteen original pixel mobs that bob, blink and shuffle their feet.
- `scripts/check-biomes.mjs`: contrast, motion speed, scene size and scene safety checks on every push.
- Tests run by Claude Code's own test runner.
- The trailer, biome previews and website art, all rendered from the real plugin code.
