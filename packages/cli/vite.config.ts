import { defineConfig, Plugin } from 'vite'
import { resolve } from 'path'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'

function addShebang(): Plugin {
  return {
    name: 'add-shebang',
    generateBundle(options, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && chunk.isEntry) {
          chunk.code = '#!/usr/bin/env node\n' + chunk.code.replace(/^#!/gm, '')
        }
      }
    }
  }
}

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/cli.ts'),
      name: 'todo-app',
      fileName: 'todo-app',
      formats: ['es']
    },
    rollupOptions: {
      plugins: [
        nodeResolve({
          preferBuiltins: true,
          exportConditions: ['node'],
          extensions: ['.js', '.ts', '.mjs', '.json']
        }) as Plugin,
        commonjs() as Plugin,
        json({
          exclude: ['**/ajv/**']
        }) as Plugin,
        addShebang()
      ],
      external: [
        // Keep Node.js built-ins external
        'node:child_process',
        'node:path',
        'node:url',
        'node:fs',
        'node:os',
        'node:process',
        'node:crypto',
        'node:events',
        'node:stream',
        'node:util',
        'node:buffer',
        'child_process',
        'path',
        'url',
        'fs',
        'os',
        'process',
        'crypto',
        'events',
        'stream',
        'util',
        'buffer',
        // Keep these packages external since they have CommonJS issues
        'commander',
        'pino',
        'better-sqlite3',
        'ws',
        'zod',
        '@modelcontextprotocol/sdk'
      ],
      output: {
        format: 'es',
        entryFileNames: 'todo-app',
        inlineDynamicImports: true
      }
    },
    target: 'node18',
    minify: false,
    sourcemap: false,
    outDir: 'dist'
  },
  resolve: {
    alias: {
      '@todo-app/backend/server': resolve(__dirname, '../backend/src/server.ts'),
      '@todo-app/backend/database/connection': resolve(__dirname, '../backend/src/database/connection.ts'),
      '@todo-app/backend/services/todo-service': resolve(__dirname, '../backend/src/services/todo-service.ts'),
      '@todo-app/backend': resolve(__dirname, '../backend/src'),
      '@todo-app/shared': resolve(__dirname, '../shared/src'),
      '@todo-app/mcp': resolve(__dirname, '../mcp/src')
    },
    extensions: ['.ts', '.js', '.mjs', '.json']
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    global: 'globalThis'
  },
  esbuild: {
    target: 'node18',
    platform: 'node',
    format: 'esm'
  }
})
