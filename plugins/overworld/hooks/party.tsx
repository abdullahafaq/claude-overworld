// The Party pane.
//
// Claude sends out a subagent → it spawns here as a mob (which mob depends on the agent type, see CAST).
// Each card tracks: the task, the tool it's on right now, tokens from the API's own usage numbers, and a
// running timer. When it finishes it moves down to "back at spawn".
//
// How it stays light:
//   · writes are queued and flushed together every BATCH_MS; a flush that changes nothing is skipped
//   · the one-second clock only runs while the pane is open and somebody is still out
//   · no polling, and no network, file or process access
// How it stays safe:
//   · it all lives in session memory; the only thing saved is whether you closed the pane
//   · text is plain (no Markdown, no links), trimmed, and run through privacy.ts so keys get masked

import { atom, read, update } from 'claude-code'
import type { EngineInterface as Engine, Register, Timer } from 'claude-code'

import type { Member } from '../types'
import { portrait, type MobName } from './mobs'
import { clip, tidy } from './privacy'

export const PANE = 'overworld-party'
// Not "Agents": Claude Code has its own agents view, and two tabs with one name is confusing.
const TITLE = 'Party'
const BATCH_MS = 250
const TICK_MS = 1000
const MAX_LINE = 120
const MAX_KEPT = 24 // finished agents past this fall off the list
const SHOWN_DONE = 6 // finished agents shown in full; older ones fold into a count
const RECENT = 8
const XP_FULL = 100_000 // tokens at which the XP bar is full
const SEGMENTS = 10

// 'crew-1': change the tag if Member's fields change, so a value an older version stored is dropped, not misread.
const crew = atom({ plugin: 'overworld', key: 'crew' } as const, [], { shape: 'crew-1' })
const now = atom({ plugin: 'overworld', key: 'now' } as const, 0)
const isPartyHidden = atom({ plugin: 'overworld', key: 'isPartyHidden' } as const, false)
const unfolded = atom({ plugin: 'overworld', key: 'unfolded' } as const, {})

/** The accent the pane borrows from the active biome. Set by register.tsx whenever the theme changes. */
let accent: string | undefined
export function setPartyAccent(colour: string | undefined): void {
  accent = colour
}

// ---------------------------------------------------------------- who's who

/** Which mob turns up for which agent. Anything else gets a steady pick from the spare mobs. */
const CAST: ReadonlyArray<[RegExp, MobName]> = [
  [/^general-purpose$/i, 'fox'],
  [/^explore$/i, 'parrot'],
  [/^plan$/i, 'panda'],
  [/review|security|audit/i, 'wolf'],
  [/test|qa|e2e|lint|build|check/i, 'creeper'],
  [/fetch|web|research|search|docs/i, 'bee'],
]
const SPARES: readonly MobName[] = ['axolotl', 'frog', 'cat', 'enderman', 'strider', 'armadillo']

export function mobFor(type: string): MobName {
  const hit = CAST.find(([pattern]) => pattern.test(type))
  if (hit) return hit[1]
  let h = 0
  for (const ch of type) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return SPARES[h % SPARES.length]!
}

/** How an agent is doing, in words, for screen readers and the finished list. */
function stateWord(m: Member): string {
  return m.state === 'running' ? 'running' : m.state === 'failed' ? failWord(m.type) : 'done'
}

/** The word for a failed run. Creepers get their own. */
export function failWord(type: string): string {
  return mobFor(type) === 'creeper' ? 'blew up' : 'failed'
}

// ---------------------------------------------------------------- batching

type Edit = (list: Member[]) => Member[]
let queue: Edit[] = []
let flushTimer: Timer | undefined
let ticker: Timer | undefined
let isPaneOpen = false

function enqueue($: Engine, edit: Edit): void {
  queue.push(edit)
  if (flushTimer) return
  flushTimer = $.clock.after(BATCH_MS, () => {
    flushTimer = undefined
    const edits = queue
    queue = []
    void apply($, edits)
  })
}

async function apply($: Engine, edits: Edit[]): Promise<void> {
  const before = (await read($, crew)) ?? []
  // Edits hand back the same array when nothing changed, and an unchanged write would still redraw.
  if (edits.reduce((list, edit) => edit(list), before) === before) return
  await update($, crew, list => edits.reduce((l, edit) => edit(l), list ?? []))
}

const join = (member: Member): Edit => list => [...list.filter(m => m.id !== member.id), member].slice(-MAX_KEPT)

const patch = (id: string, change: Partial<Member>): Edit => list => {
  const i = list.findIndex(m => m.id === id)
  const old = list[i]
  if (!old) return list
  const keys = Object.keys(change) as Array<keyof Member>
  if (keys.every(k => old[k] === change[k])) return list
  const next = list.slice()
  next[i] = { ...old, ...change }
  return next
}

const didTool = (id: string, line: string): Edit => list => {
  const old = list.find(m => m.id === id)
  if (!old) return list
  return patch(id, { tool: line, recent: [...old.recent, line].slice(-RECENT) })(list)
}

async function startClock($: Engine): Promise<void> {
  if (ticker || !isPaneOpen) return
  await update($, now, () => Date.now())
  ticker = $.clock.every(TICK_MS, () => {
    void (async () => {
      const list = (await read($, crew)) ?? []
      if (!isPaneOpen || !list.some(m => m.state === 'running')) {
        ticker?.cancel()
        ticker = undefined
        return
      }
      await update($, now, () => Date.now())
    })()
  })
}

// ---------------------------------------------------------------- describing work

/** A short, safe line for a tool call: the tool and the one argument that says what it's doing. */
export function describeTool(tool: string, args: Record<string, unknown>): string {
  const pick = (key: string) => (typeof args[key] === 'string' ? (args[key] as string) : '')
  const detail =
    pick('command') || pick('pattern') || pick('file_path') || pick('path') || pick('query') || pick('description') ||
    (pick('url') ? hostOf(pick('url')) : '')
  return tidy(detail ? `${tool} ${shortPath(detail)}` : tool, MAX_LINE)
}

function hostOf(url: string): string {
  const match = url.match(/^[a-z]+:\/\/([^/?#]+)/i)
  return match?.[1] ?? url
}

/** Home folders and long absolute paths make the line noisy; keep the tail that matters. */
function shortPath(text: string): string {
  return text.replace(/\/(Users|home)\/[^/\s]+/g, '~').replace(/(?:[^\s/]+\/){3,}([^\s/]+\/[^\s/]+)/g, '…/$1')
}

function duration(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000))
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`
}

function tokens(n: number): string {
  return n < 1000 ? String(n) : `${(n / 1000).toFixed(1)}k`
}

/** Ten segments filling up as the agent's context grows. Text, so it works in the terminal too. */
export function xpBar(n: number): string {
  const lit = Math.min(SEGMENTS, Math.round((n / XP_FULL) * SEGMENTS))
  return '▰'.repeat(lit) + '▱'.repeat(SEGMENTS - lit)
}

// ---------------------------------------------------------------- hooks

export const registerParty: Register = on => {
  on('agent.spawn', async ($, e, next) => {
    const started = await next(e)
    if (started.agentId) {
      enqueue($, join({
        id: started.agentId,
        type: clip(e.subagentType || 'agent', 48),
        task: tidy(e.description || e.prompt, MAX_LINE),
        model: clip((started.model ?? '').replace(/^claude-/, ''), 32),
        state: 'running',
        tool: 'spawning in…',
        tokens: 0,
        startedAt: await $.clock.now(),
        endedAt: 0,
        recent: [],
      }))
      if (!isPaneOpen && !(await read($, isPartyHidden))) {
        isPaneOpen = true
        void $.ui.open({ id: PANE, title: TITLE })
      }
      void startClock($)
    }
    return started
  }).catch(($, e, next) => next(e))

  // A resumed agent or a teammate starting a new turn counts as out again.
  on('turn.start', async ($, e, next) => {
    if (e.agentId) {
      enqueue($, patch(e.agentId, { state: 'running', endedAt: 0 }))
      void startClock($)
    }
    return next(e)
  }).catch(($, e, next) => next(e))

  on('tool.call', ($, e, next) => {
    if (e.agentId) enqueue($, didTool(e.agentId, describeTool(e.tool, e as unknown as Record<string, unknown>)))
    return next(e)
  }).catch(($, e, next) => next(e))

  // Token count straight from the API's usage block for the agent's latest request.
  on('turn.step', async function* ($, e, next) {
    const step = yield* next(e)
    const usage = step.usage
    if (e.agentId && usage) {
      const total = usage.input_tokens + (usage.cache_read_input_tokens ?? 0) + (usage.cache_creation_input_tokens ?? 0) + usage.output_tokens
      enqueue($, patch(e.agentId, { tokens: total }))
    }
    return step
  })

  on('turn.complete', async ($, e, next) => {
    const done = await next(e)
    if (e.agentId) {
      const failed = e.reason === 'error' || e.reason === 'aborted' || e.reason === 'refusal'
      enqueue($, patch(e.agentId, { state: failed ? 'failed' : 'done', tool: failed ? 'stopped' : 'back at spawn', endedAt: await $.clock.now() }))
    }
    return done
  }).catch(($, e, next) => next(e))

  // You closed it, so it stays closed (until /overworld party on).
  on('ui.close', async ($, e, next) => {
    if (e.id === PANE) {
      isPaneOpen = false
      await update($, isPartyHidden, () => true)
    }
    return next(e)
  }).catch(($, e, next) => next(e))

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const table = $.ui.resolve(e)
    const { Box, Text, Button } = table
    // The terminal has no Svg, so it gets a coloured block instead of the mob's portrait.
    const face = (m: Member, size: number) => 'Svg' in table
      ? <table.Svg source={portrait(mobFor(m.type), m.state === 'failed')} alt={`${mobFor(m.type)}: ${m.type}, ${stateWord(m)}`} width={size} height={size} />
      : <Text color={accent}>■</Text>
    const list = (await read($, crew)) ?? []
    const open = (await read($, unfolded)) ?? {}
    const clock = (await read($, now)) || Date.now()
    const running = list.filter(m => m.state === 'running')
    const finished = list.filter(m => m.state !== 'running').reverse()
    const failedCount = finished.filter(m => m.state === 'failed').length
    const total = list.reduce((sum, m) => sum + m.tokens, 0)
    const toggle = (id: string) => async () => update($, unfolded, map => ({ ...map, [id]: !map?.[id] }))
    const elapsed = (m: Member) => duration((m.endedAt || clock) - m.startedAt)

    const activity = (m: Member) => (
      <Box flexDirection="column" gap={0}>
        <Button key={`fold-${m.id}`} plain onPress={toggle(m.id)}>
          <Text mono size="caption" color={accent}>{open[m.id] ? '− trail' : '+ trail'}</Text>
        </Button>
        {open[m.id] && (
          <Box flexDirection="column" paddingLeft={1}>
            {m.recent.length === 0 && <Text mono size="caption" dimColor>no tools used yet</Text>}
            {m.recent.map(line => <Text mono size="caption" dimColor wrap="truncate-end">{line}</Text>)}
          </Box>
        )}
      </Box>
    )

    return (
      <Box flexDirection="column" gap={1} padding={1}>
        <Box flexDirection="row" justifyContent="space-between">
          <Text mono size="caption" weight="semibold" color={accent}>PARTY</Text>
          <Text mono size="caption" dimColor>{running.length} out · {tokens(total)} tokens</Text>
        </Box>

        {list.length === 0 && (
          <Text size="caption" dimColor>Nobody's out yet. Next time Claude sends an agent, it spawns in here.</Text>
        )}

        {running.map(m => (
          <Box flexDirection="row" gap={1} padding={1} borderStyle="round" width="100%" overflow="hidden">
            {face(m, 48)}
            <Box flexDirection="column" gap={0} flexGrow={1} flexShrink={1} minWidth={0} overflow="hidden">
              <Text weight="semibold" wrap="truncate-end">{m.type}{m.model ? ` · ${m.model}` : ''}</Text>
              <Text size="caption" dimColor wrap="truncate-end">{m.task}</Text>
              <Text mono size="caption" dimColor wrap="truncate-end">↳ {m.tool}</Text>
              <Text mono size="caption" color={accent} wrap="truncate-end">XP {xpBar(m.tokens)} <Text dimColor>{tokens(m.tokens)} · {elapsed(m)}</Text></Text>
              {activity(m)}
            </Box>
          </Box>
        ))}

        {finished.length > 0 && (
          <Text mono size="caption" dimColor>
            BACK AT SPAWN · {finished.length}{failedCount ? ` · ${failedCount} didn't make it` : ''}
          </Text>
        )}

        {finished.slice(0, SHOWN_DONE).map(m => (
          <Box flexDirection="row" gap={1} width="100%" overflow="hidden">
            {face(m, 32)}
            <Box flexDirection="column" gap={0} flexGrow={1} flexShrink={1} minWidth={0} overflow="hidden">
              <Text weight="semibold" wrap="truncate-end">
                {m.type}{m.state === 'failed' ? ` · ${failWord(m.type)}` : ''}
              </Text>
              <Text size="caption" dimColor wrap="truncate-end">{m.task} · {tokens(m.tokens)} · {elapsed(m)}</Text>
              {activity(m)}
            </Box>
          </Box>
        ))}

        {finished.length > SHOWN_DONE && (
          <Text size="caption" dimColor>+{finished.length - SHOWN_DONE} older</Text>
        )}
      </Box>
    )
  })
}

/** Opens the pane again (for /overworld party on). */
export async function showParty($: Engine): Promise<void> {
  await update($, isPartyHidden, () => false)
  isPaneOpen = true
  await $.ui.open({ id: PANE, title: TITLE })
  void startClock($)
}

/** Hides it and keeps it hidden (for /overworld party off). */
export async function hideParty($: Engine): Promise<void> {
  await update($, isPartyHidden, () => true)
  isPaneOpen = false
  await $.ui.close({ id: PANE })
}
