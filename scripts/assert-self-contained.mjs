import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const host = readFileSync(resolve(root, 'lib/index.js'), 'utf8')
const forbidden = ["from '@deepseek-ai/schemastery'", 'from "@deepseek-ai/schemastery"']
for (const token of forbidden) {
  if (host.includes(token)) {
    throw new Error(`lib/index.js still imports ${token}; bundle schemastery`)
  }
}
console.log('lib/index.js is self-contained for schemastery')
