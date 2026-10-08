import { test, expect } from 'claude-code/testing'
import { extractBlocks } from './register'

test('extracts fenced blocks without fences or indentation noise', () => {
  const md = 'Intro\n\n```\nHi Sam,\n\nLine two\n```\n\ntext\n\n```text\nSecond\n```\n'
  expect(extractBlocks(md)).toEqual(['Hi Sam,\n\nLine two', 'Second'])
})

test('no blocks in plain text', () => {
  expect(extractBlocks('just text, `inline` code')).toEqual([])
})
