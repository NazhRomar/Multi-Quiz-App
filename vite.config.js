import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const buildDate = new Date().toISOString()

// Emits dist/sw.js (the PWA's offline service worker) from
// pwa/service-worker.js, baking in this build's file list — hashed JS/CSS
// from the bundle plus everything copied from public/ — and a per-build
// cache version. Build-only: the dev server runs without a service worker.
function serviceWorker() {
  const publicFiles = (dir, prefix = '') =>
    readdirSync(dir).flatMap((name) => {
      const path = join(dir, name)
      return statSync(path).isDirectory() ? publicFiles(path, `${prefix}${name}/`) : [`${prefix}${name}`]
    })

  return {
    name: 'multi-quiz-service-worker',
    apply: 'build',
    generateBundle(_, bundle) {
      const urls = [
        './', // the app shell (index.html)
        ...Object.keys(bundle).filter((file) => !file.endsWith('.html')),
        ...publicFiles('public'),
      ]
      const source = readFileSync('pwa/service-worker.js', 'utf8')
        .replace('__PRECACHE_URLS__', JSON.stringify(urls))
        .replace('__CACHE_VERSION__', JSON.stringify(buildDate))
      this.emitFile({ type: 'asset', fileName: 'sw.js', source })
    },
  }
}

export default defineConfig({
  base: '/', // Change this back to '/' (or delete the base line entirely)
  plugins: [react(), serviceWorker()],
  define: {
    __BUILD_DATE__: JSON.stringify(buildDate),
  },
})
