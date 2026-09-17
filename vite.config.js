import { execSync } from 'node:child_process'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const buildDate = new Date().toISOString()

// The home menu's changelog (menu/ChangelogModal.jsx), read straight from git
// history at build time so it can't drift from what actually shipped.
//
// Quiz content is deliberately left out: a commit whose every changed file is
// a quiz JSON is an answer bank going in or being corrected, not a change to
// the app, and there are enough of them to bury everything else. The test is
// structural rather than a guess at the wording of the message — a commit that
// adds a quiz AND touches the app is an app change and stays.
//
// Anything that stops this working (git missing, a shallow clone carrying no
// history, building from a tarball) yields an empty list, and the button hides
// itself rather than opening an empty panel.
const QUIZ_DATA = /^src\/data\/.*\.json$/
const REC = '\x1e' // between commits
const FIELD = '\x1f' // between fields

function readChangelog() {
  try {
    const raw = execSync('git log --date=short --format=%x1e%H%x1f%ad%x1f%s%x1f%b%x1f --name-only', {
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    return raw
      .split(REC)
      .filter((record) => record.trim())
      .map((record) => {
        const [hash, date, subject, body, files = ''] = record.split(FIELD)
        return {
          hash: hash.trim(),
          date,
          subject,
          body: body.trim(),
          files: files.split('\n').map((f) => f.trim()).filter(Boolean),
        }
      })
      // A merge lists no files of its own, so it can't be mistaken for
      // quiz-only and stays in.
      .filter((c) => !(c.files.length && c.files.every((f) => QUIZ_DATA.test(f))))
      .map(({ hash, date, subject, body }) => ({ hash: hash.slice(0, 7), date, subject, body }))
  } catch (e) {
    return []
  }
}

// Links each entry to its commit on GitHub. An SSH remote is rewritten to the
// https form; anything unrecognized just means no links.
function readRepoUrl() {
  try {
    const remote = execSync('git remote get-url origin', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    const match = remote.match(/github\.com[:/](.+?)(?:\.git)?$/)
    return match ? `https://github.com/${match[1]}` : ''
  } catch (e) {
    return ''
  }
}

const changelog = readChangelog()
const repoUrl = readRepoUrl()

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

// Publishes the changelog as its own file rather than inlining it: the
// entries are ~54 kB, almost all of it commit bodies, and the panel is opened
// rarely — no reason to carry that in the bundle every load. It's emitted into
// the build output, which means serviceWorker() below lists it among the
// precached URLs and the panel keeps working offline. This plugin must stay
// ahead of serviceWorker() in the plugins array for that to hold.
function changelogAsset() {
  const json = JSON.stringify(changelog)
  return {
    name: 'multi-quiz-changelog',
    // The dev server has no bundle to emit into, so serve it from memory.
    configureServer(server) {
      server.middlewares.use('/changelog.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.end(json)
      })
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'changelog.json', source: json })
    },
  }
}

export default defineConfig({
  base: '/', // Change this back to '/' (or delete the base line entirely)
  plugins: [react(), changelogAsset(), serviceWorker()],
  build: {
    // Every quiz JSON is bundled into the main JS (catalog.js eager glob),
    // so it passed Vite's 500 kB warning once the question bank grew.
    // TODO: load quiz data on demand (code-split the JSON) and drop this.
    chunkSizeWarningLimit: 1000,
  },
  define: {
    __BUILD_DATE__: JSON.stringify(buildDate),
    // Only the count rides in the bundle, so the footer can decide whether
    // to show the button; the entries themselves are a separate file the
    // panel fetches when it's opened (changelogAsset below).
    __CHANGELOG_COUNT__: JSON.stringify(changelog.length),
    __REPO_URL__: JSON.stringify(repoUrl),
  },
})
