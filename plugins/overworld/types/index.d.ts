// The values Overworld keeps in Claude Code's session state. Claude Code checks every state key the
// hooks module touches against this file.

export type MemberState = 'running' | 'done' | 'failed'

/** One agent in the party. Every string here has already been cut short and had secrets masked. */
export type Member = {
  id: string
  /** The agent type, like "Explore" or "code-reviewer". */
  type: string
  /** The short description the agent was started with. */
  task: string
  model: string
  state: MemberState
  /** What it's doing right now, like "Grep useSession". */
  tool: string
  /** The size of its latest request (input, cache and output), as the API reported it. */
  tokens: number
  startedAt: number
  /** When it finished, in ms since the epoch; 0 while it runs. */
  endedAt: number
  /** Its latest tool calls, oldest first, at most 8. */
  recent: string[]
}

declare module 'claude-code' {
  interface PluginState {
    overworld: {
      crew: Shaped<Member[]>
      now: number
      isPartyHidden: boolean
      unfolded: Record<string, boolean>
    }
  }
}
