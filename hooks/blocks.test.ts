import { test, expect } from 'claude-code/testing'
import { extractBlocks } from './register'

test('extracts fenced blocks without fences or indentation noise', () => {
  const md = 'Intro\n\n```\nHi Sam,\n\nLine two\n```\n\ntext\n\n```text\nSecond\n```\n'
  expect(extractBlocks(md)).toEqual(['Hi Sam,\n\nLine two', 'Second'])
})

test('no blocks in plain text', () => {
  expect(extractBlocks('just text, `inline` code')).toEqual([])
})

test('strips list indentation from a nested fence', () => {
  const md = '1. Run this:\n\n   ```sh\n   cd app\n     npm test\n   ```\n'
  expect(extractBlocks(md)).toEqual(['cd app\n  npm test'])
})

test('tilde fences, empty and unclosed blocks', () => {
  const md = '~~~\nA\n~~~\n\n```\n\n```\n\n```\nnever closed\n'
  expect(extractBlocks(md)).toEqual(['A'])
})

test('a longer fence can hold a shorter one', () => {
  const md = '````md\n```\ninner\n```\n````\n'
  expect(extractBlocks(md)).toEqual(['```\ninner\n```'])
})

test('caps at nine blocks', () => {
  const md = Array.from({ length: 12 }, (_, i) => '```\nb' + i + '\n```').join('\n\n')
  expect(extractBlocks(md)).toHaveLength(9)
})

test('a blockquote becomes a block, without the quote markers', () => {
  const md = 'Here is the post:\n\n> First paragraph,\n> still first.\n>\n> Second paragraph.\n\nWant changes?\n'
  expect(extractBlocks(md)).toEqual(['First paragraph,\nstill first.\n\nSecond paragraph.'])
})

test('quotes and fences keep their order; > inside a fence is code', () => {
  const md = '> Quote one\n\n```sh\necho a > b.txt\n```\n\n> Quote two\n'
  expect(extractBlocks(md)).toEqual(['Quote one', 'echo a > b.txt', 'Quote two'])
})

test('an empty quote gets no button', () => {
  expect(extractBlocks('>\n>\n\ntext')).toEqual([])
})
