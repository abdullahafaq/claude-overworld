// Scrubbing for anything the Party pane shows: mask what looks like a credential, squash whitespace, trim.

const SECRET_PATTERNS: readonly RegExp[] = [
  /\b(sk|pk|rk)[-_][A-Za-z0-9_-]{16,}\b/g, // API keys in the sk-... style
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g, // GitHub tokens
  /\bxox[abpr]-[A-Za-z0-9-]{10,}\b/g, // Slack tokens
  /\bAKIA[0-9A-Z]{16}\b/g, // AWS access key ids
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, // JWTs
  /\b(Bearer|token|password|passwd|secret|api[_-]?key)(\s*[:=]\s*|\s+)\S+/gi, // key=value style
]

/** Masks anything that looks like a secret. */
export function redact(text: string): string {
  return SECRET_PATTERNS.reduce((out, pattern) => out.replace(pattern, match => {
    const keep = match.match(/^(Bearer|token|password|passwd|secret|api[_-]?key)(\s*[:=]\s*|\s+)/i)
    return keep ? `${keep[0]}•••` : '•••'
  }), text)
}

/** One line, cut short with an ellipsis. */
export function clip(text: string, max: number): string {
  const line = text.replace(/\s+/g, ' ').trim()
  return line.length > max ? `${line.slice(0, max - 1)}…` : line
}

/** Both at once: what anything shown in the pane goes through. */
export function tidy(text: string, max: number): string {
  return clip(redact(text), max)
}
