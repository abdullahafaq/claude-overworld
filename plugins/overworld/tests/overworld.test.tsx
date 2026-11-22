// Tests for Overworld, run by Claude Code itself: claude plugin test plugins/overworld
// Each hook registered with `on` here stands in for the engine underneath the plugin.

import { expect, mock, test } from 'claude-code/testing'

const PARTY = {
  plugin: 'overworld',
  component: 'Pane',
  requestId: 'overworld-party',
  props: { title: 'Party', isFocused: false, bodyColumns: 44, placement: 'dock', scroll: { offset: 0, bodyRows: 30 }, view: {} },
} as const

/** What typing `/overworld <args>` in the message box sends. */
const typed = (args: string) => ({ command: 'overworld', args, origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 100 } }) as const

/** A subagent the Agent tool starts. */
const spawn = (subagentType: string, description: string) => ({
  tool_use_id: `call-${subagentType}`, prompt: description, description, subagentType,
  provider: { plugin: 'engine', tier: 'core' }, parentModel: 'opus', background: false, fork: false,
}) as const

test('/overworld lists every biome', async ($, on) => {
  mock.store(on)
  on('command.register', () => ({ value: { command: 'overworld' } }))
  on('theme.set', () => ({ value: { isDrawn: true, requestId: 'look' } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  const listed = await $.command.run(typed(''))
  for (const name of ['Sakura Night', 'Meadow', 'Jungle', 'Desert Night', 'Badlands', 'Aurora', 'Ocean', 'The End', 'Nether', 'Deep Dark']) {
    expect(listed.text).toContain(name)
  }
})

test('switching biome sets the theme and remembers it', async ($, on) => {
  mock.store(on)
  const scenes: string[] = []
  on('command.register', () => ({ value: { command: 'overworld' } }))
  on('theme.set', (_, e) => {
    scenes.push(String((e as { backdrop?: { scene?: string } }).backdrop?.scene))
    return { value: { isDrawn: true, requestId: 'look' } }
  })
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  const reply = await $.command.run(typed('ocean'))
  expect(reply.text).toContain('Ocean')
  expect(scenes.at(-1)).toBe('overworld-ocean')
  const listed = await $.command.run(typed(''))
  expect(listed.text).toMatch(/▶ Ocean/)

  await $.command.run(typed('still'))
  expect(scenes.at(-1)).toBe('overworld-ocean-still')
})

test('an unknown biome gets a friendly answer, not a crash', async ($, on) => {
  mock.store(on)
  on('command.register', () => ({ value: { command: 'overworld' } }))
  on('theme.set', () => ({ value: { isDrawn: true, requestId: 'look' } }))
  const reply = await $.command.run(typed('the moon'))
  expect(reply.text).toContain('No biome called')
})

test('the backdrop draws our scene on desktop and leaves others alone', async ($, on) => {
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>engine</Text>
  })

  const ours = await $.ui.mount({ plugin: 'overworld', component: 'Backdrop', surface: 'desktop', props: { scene: 'overworld-nether', plugin: 'overworld', glass: false } })
  const svg = await ours.find({ type: 'Svg' })
  expect(String(svg?.props?.source)).toContain('<svg')
  expect(String(svg?.props?.alt)).toContain('Nether')
  await ours.unmount()

  const theirs = await $.ui.mount({ plugin: 'overworld', component: 'Backdrop', surface: 'desktop', props: { scene: 'someone-else', plugin: 'someone-else', glass: false } })
  expect((await theirs.find({ type: 'Text' }))?.text).toBe('engine')
  await theirs.unmount()
})

test('a subagent spawns into the party as its mob, with secrets masked', async ($, on) => {
  const clock = mock.clock(on, { now: 1_000 })
  mock.store(on)
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('agent.spawn', () => ({ model: 'haiku', agentId: 'a1' }))
  on('tool.call', () => ({ result: {} }))

  await $.agent.spawn(spawn('Explore', 'Find the header with token=abc123secret'))
  await clock.advance(400)

  const ui = await $.ui.mount({ ...PARTY, surface: 'desktop' })
  expect((await ui.find({ type: 'Text', text: /Explore/ }))?.text).toContain('Explore')
  const task = await ui.find({ type: 'Text', text: /Find the header/ })
  expect(task?.text).not.toContain('abc123secret')
  const face = await ui.find({ type: 'Svg' })
  expect(String(face?.props?.alt)).toContain('parrot')
  await ui.unmount()
})

test('a test runner that fails is a creeper that blew up', async ($, on) => {
  const clock = mock.clock(on, { now: 1_000 })
  mock.store(on)
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('agent.spawn', () => ({ model: 'haiku', agentId: 't1' }))
  on('turn.complete', () => ({ text: '' }))

  await $.agent.spawn(spawn('test-runner', 'Run the e2e suite'))
  await $.turn.complete({ agentId: 't1', reason: 'error', answer: '' } as never)
  await clock.advance(400)

  const ui = await $.ui.mount({ ...PARTY, surface: 'desktop' })
  expect((await ui.find({ type: 'Text', text: /blew up/ }))?.text).toContain('test-runner')
  await ui.unmount()
})

test('the party pane works in the terminal too, without pictures', async ($, on) => {
  const clock = mock.clock(on, { now: 1_000 })
  mock.store(on)
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('agent.spawn', () => ({ model: 'opus', agentId: 'p1' }))

  await $.agent.spawn(spawn('Plan', 'Work out the breakpoints'))
  await clock.advance(400)

  const ui = await $.ui.mount({ ...PARTY, surface: 'terminal' })
  expect((await ui.find({ type: 'Text', text: /Plan/ }))?.text).toContain('Plan')
  await ui.unmount()
})
