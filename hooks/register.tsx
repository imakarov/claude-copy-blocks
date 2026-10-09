import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

const blocks = atom({ plugin: 'copy-blocks', key: 'blocks' } as const, [] as string[])
const isHidden = atom({ plugin: 'copy-blocks', key: 'isHidden' } as const, false)

// Fenced blocks (``` or ~~~) of a markdown reply, info string dropped.
export function extractBlocks(markdown: string): string[] {
  const found: string[] = []
  const fence = /^([ \t]*)(`{3,}|~{3,})[^\n]*\n([\s\S]*?)\n[ \t]*\2[ \t]*$/gm
  for (const m of markdown.matchAll(fence)) {
    // A fence nested in a list is indented; drop that indent from every line.
    const indent = m[1].length
    const body = m[3]
      .split('\n')
      .map(line => line.replace(new RegExp(`^[ \\t]{0,${indent}}`), ''))
      .join('\n')
      .replace(/\s+$/, '')
    if (body.trim()) found.push(body)
  }
  return found.slice(0, 9)
}

function preview(text: string, width: number): string {
  const line = text.replace(/\s+/g, ' ').trim()
  return line.length > width ? line.slice(0, Math.max(10, width - 1)) + '…' : line
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'cp',
      description: 'Copy code block N (default 1) of the last reply to the clipboard',
    })
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    // Only the main loop's answers: a subagent's turn or an interrupted one keeps the band.
    if (e.agentId || e.reason !== 'answer') return result
    const found = extractBlocks(result.text ?? '')
    await update($, blocks, () => found)
    await update($, isHidden, () => false)
    return result
  })

  on('command.run', { command: 'cp' }, async ($, e) => {
    const list = await read($, blocks)
    const n = Number.parseInt(e.args.trim() || '1', 10)
    const text = list[n - 1]
    if (!text) return { text: list.length ? `No block ${n}. Available: 1–${list.length}.` : 'No code blocks in the last reply.' }
    const r = await $.ui.copy({ text })
    return { text: r.isCopied ? `📋 Block ${n} copied` : `Copy failed: ${r.reason}` }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const list = await read($, blocks)
    if (e.props.hasSurvey || list.length === 0 || (await read($, isHidden))) return next(e)

    const { Box, Button, Text } = $.ui.resolve(e)
    const width = Math.max(20, (e.props.bodyColumns ?? 80) - 12)

    return (
      <Box flexDirection="column">
        {list.map((text, i) => (
          <Box key={`row${i}`}>
            <Button
              key={`copy${i}`}
              label={`📋 ${i + 1}`}
              hotkey={String(i + 1)}
              onPress={async press => {
                const r = await $.ui.copy({ text, surface: press.surface })
                $.ui.toast(r.isCopied ? `📋 Block ${i + 1} copied` : `Copy failed: ${r.reason}`)
              }}
            />
            <Text dimColor> {preview(text, width)}</Text>
          </Box>
        ))}
        <Button key="hide" label="×" plain onPress={() => update($, isHidden, () => true)} />
      </Box>
    )
  })
}
