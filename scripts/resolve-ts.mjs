// Node can run the plugin's TypeScript as-is, but it wants full file names in imports, while Claude Code
// mods import without extensions ('./pixels'). This hook tries .ts, .tsx and .js until one resolves.
// Used like: node --import ./scripts/resolve-ts.mjs scripts/check-biomes.mjs

import { registerHooks } from 'node:module'

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && !/\.[cm]?[jt]sx?$/.test(specifier)) {
      for (const ext of ['.ts', '.tsx', '.js']) {
        try {
          return nextResolve(specifier + ext, context)
        } catch {
          // not this one
        }
      }
    }
    return nextResolve(specifier, context)
  },
})
