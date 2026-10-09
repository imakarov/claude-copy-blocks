# copy-blocks

Copy Claude's drafts out of the terminal exactly as written: emails, LinkedIn
posts, Telegram and Slack replies, messages, quotes. One click, nothing to fix
after pasting.

## The problem

You ask Claude Code to draft a reply to a client, a LinkedIn post or an answer
in a Telegram chat. The text is good. Then you select it in the terminal, paste
it into Gmail or LinkedIn, and it comes out broken:

- every line starts with extra spaces, because Claude Code indents its output;
- sentences are cut into pieces wherever the terminal wrapped a long line;
- a quote bar or border characters come along with the text.

So before sending you spend a minute deleting spaces and joining lines back
together. Every single time.

## What copy-blocks does

Ask Claude to put the text you will send inside a block (see
[the CLAUDE.md snippet](#make-claude-put-drafts-in-blocks) below). After the
reply, each block gets a button above the prompt. Click it and the exact text
goes to your clipboard: the paragraphs Claude wrote, no extra spaces, no broken
lines. Paste it into the email, the post or the chat and send.

```
 [ 📋 1 ]  Hi Sam, thanks for the quick review. I pushed the fix and…
 [ 📋 2 ]  Three things I learned shipping our first AI feature to 10k u…
 [ 📋 3 ]  Sounds good, let's do Thursday at 3pm. I'll send the invite.
 ×
 ──────────────────────────────────────────────────────────────────────
 >
```

One reply can hold several versions (a formal and a casual answer, a post and
its first comment), and each gets its own button.

Works for:

- **email replies** and cold emails;
- **LinkedIn** posts, comments and DMs;
- **Telegram, WhatsApp, Slack** answers;
- quotes, bios, announcements, review replies;
- and, of course, commands and code snippets.

## Make Claude put drafts in blocks

copy-blocks gives a button to every fenced block (```` ``` ```` or `~~~`) in
Claude's reply. Commands and code already come in blocks; drafts of messages
usually come as plain paragraphs. Add this to `~/.claude/CLAUDE.md` (or a
project `CLAUDE.md`) so they come in blocks too:

```markdown
## Text I will send
When a reply contains text I will paste somewhere else (an email, a LinkedIn
post or comment, a Telegram/Slack/WhatsApp message, a quote, a command), put
each piece in its own fenced code block with no commentary inside the block.
If there are several versions, give each its own block, the main one first.
```

## Install

From GitHub, as a plugin marketplace:

```sh
claude plugin marketplace add imakarov/claude-copy-blocks
claude plugin install copy-blocks@claude-copy-blocks
```

Or in one step:

```sh
claude plugin install copy-blocks --marketplace imakarov/claude-copy-blocks
```

Restart Claude Code (or run `/reload-plugins` in a running session).
Update later with `claude plugin marketplace update claude-copy-blocks` then
`claude plugin update copy-blocks@claude-copy-blocks`.

### Manual alternative

Clone the repository and load the folder directly:

```sh
git clone https://github.com/imakarov/claude-copy-blocks.git ~/claude-copy-blocks
claude --plugin-dir ~/claude-copy-blocks
```

To load it in every session (including ones the desktop app starts), add it to
the `env` block of `~/.claude/settings.json`:

```json
{
  "env": {
    "CLAUDE_CODE_PLUGIN_DIRS": "~/claude-copy-blocks"
  }
}
```

Use only one install method. Loading the plugin twice draws the buttons twice.

## Usage

- **Click** `[ 📋 N ]` to copy block N. A toast confirms the copy.
- **Keyboard:** focus the band with `ctrl+x` then `tab`, then press `1`–`9`.
- **Slash command:** `/cp N` copies block N; `/cp` alone copies block 1.
- **Hide:** `×` hides the band until the next reply.

Each row shows a one-line preview of the block so you can tell them apart.

## Limits

- Up to 9 blocks per reply; later ones get no button.
- Only the last reply. The band is replaced when the next reply completes.
- Text outside blocks gets no button: that is what the CLAUDE.md snippet is for.
- LinkedIn's post editor often drops empty lines between paragraphs on paste.
  The blank lines are in the copied text; LinkedIn removes them. Check the
  spacing in the editor and add them back with Enter before posting.
- Clicking needs a terminal that reports mouse clicks to the application. Where
  it does not, use `/cp N` or `ctrl+x` `tab` and a digit.
- Works in any terminal Claude Code runs in (Terminal.app, iTerm2, Ghostty,
  the VS Code terminal, Orca): copying goes through Claude Code's own clipboard
  support, not the terminal's text selection.

## Requirements

A Claude Code build with plugin hooks modules (mods): `hooks/hooks.json` with
`"modules"`, the `AbovePrompt` UI surface and `$.ui.copy`. Developed and tested
on Claude Code 2.1.294–2.1.295. Run `claude plugin validate <plugin folder>` to
check whether your build supports it.

## Development

```sh
claude plugin validate .   # manifest, marketplace and hooks module
claude plugin test .       # runs hooks/*.test.ts
claude --plugin-dir .      # try it in a session; edits hot-reload
```

Files:

- `hooks/register.tsx` — the hooks module: block extraction, the button band, `/cp`
- `hooks/blocks.test.ts` — tests for block extraction
- `types/index.d.ts` — the plugin's state contract
- `.claude-plugin/plugin.json` — plugin manifest
- `.claude-plugin/marketplace.json` — makes the repo installable as a marketplace

`tsconfig.json` and `.claude-plugin/types/` are generated by Claude Code when the
plugin loads and are git-ignored.

## License

[MIT](LICENSE) © 2026 Ilya Makarov
