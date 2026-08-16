/**
 * Self-contained ESM host + ModuleLoader client bundle.
 * Host runtime must not import @deepseek-ai/schemastery from the plugin
 * directory (link: installs resolve from this package, not the profile).
 * Schemastery is bundled. DSH / cordis stay external (provided by dsh).
 */
import { build } from 'esbuild'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
mkdirSync(resolve(root, 'lib'), { recursive: true })

function resolveDshCheckout() {
  const env = process.env.DSH_CHECKOUT
  if (env !== undefined && env !== '') return resolve(env)
  const candidates = [
    resolve(root, '../../deepseek-harness'),
  ]
  for (const candidate of candidates) {
    if (existsSync(resolve(candidate, 'vendor/schemastery/package.json'))) return candidate
  }
  throw new Error('Cannot find DeepSeek Harness checkout; set DSH_CHECKOUT')
}

const checkout = resolveDshCheckout()
const alias = {
  '@deepseek-ai/schemastery': resolve(checkout, 'vendor/schemastery/src/index.ts'),
  '@deepseek-ai/cosmokit': resolve(checkout, 'vendor/cosmokit/src/index.ts'),
}

const dshExternal = ['@deepseek-ai/cordis', '@deepseek-ai/dsh-*']

await build({
  absWorkingDir: root,
  entryPoints: ['src/index.ts'],
  outfile: 'lib/index.js',
  bundle: true,
  packages: 'bundle',
  format: 'esm',
  platform: 'node',
  target: ['node22'],
  sourcemap: true,
  alias,
  external: dshExternal,
  logLevel: 'info',
})

await build({
  absWorkingDir: root,
  entryPoints: ['src/invariant.ts'],
  outfile: 'lib/invariant.js',
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: ['node22'],
  sourcemap: true,
  logLevel: 'info',
})

await build({
  absWorkingDir: root,
  entryPoints: ['src/client/index.ts'],
  outfile: 'lib/client.js',
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: ['es2022'],
  sourcemap: true,
  external: [...dshExternal, 'react', 'react-dom', 'react/jsx-runtime'],
  banner: {
    js: "window.__ModuleLoader__.load({ id: 'dsh-file-ref', factory: (require) => { var module = { exports: {} }; var exports = module.exports;",
  },
  footer: {
    js: 'return module.exports; } });',
  },
  logLevel: 'info',
})
