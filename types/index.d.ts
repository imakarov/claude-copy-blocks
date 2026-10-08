export type Blocks = string[]

declare module 'claude-code' {
  interface PluginState {
    'copy-blocks': { blocks: Blocks; isHidden: boolean }
  }
}
