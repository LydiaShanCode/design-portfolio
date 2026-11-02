#!/usr/bin/env node
// Writes src/data/versionHistory.json for the design version switcher's changelog.
// Commits come from git; preview links come from the GitHub deployments Vercel creates per commit.
// Never fails the build: any missing git history, token, or network falls back to what's already on disk.
import { execSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'src/data/versionHistory.json')
const MAX_COMMITS = 200
// Unauthenticated GitHub API allows 60 requests/hour, so status lookups are capped per run.
const MAX_STATUS_LOOKUPS = 40
const TIMEOUT_MS = 6000

const sh = (cmd) => execSync(cmd, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
const trySh = (cmd) => {
  try {
    return sh(cmd)
  } catch {
    return ''
  }
}

function readExisting() {
  if (!existsSync(OUT)) return { repo: null, commits: [] }
  try {
    return JSON.parse(readFileSync(OUT, 'utf8'))
  } catch {
    return { repo: null, commits: [] }
  }
}

function detectRepo(fallback) {
  const { VERCEL_GIT_REPO_OWNER: owner, VERCEL_GIT_REPO_SLUG: slug } = process.env
  if (owner && slug) return `${owner}/${slug}`
  const remote = trySh('git remote get-url origin')
  const match = remote.match(/github\.com[:/]([^/]+\/[^/.]+)(?:\.git)?$/)
  return match?.[1] ?? fallback
}

function readGitLog() {
  const SEP = '\x1f'
  const raw = trySh(`git log -n ${MAX_COMMITS} --format=%H${SEP}%s${SEP}%aI${SEP}%an`)
  if (!raw) return []
  return raw.split('\n').map((line) => {
    const [sha, subject, date, author] = line.split(SEP)
    return { sha, subject, date, author }
  })
}

function githubToken() {
  return process.env.GITHUB_TOKEN || process.env.GH_TOKEN || trySh('gh auth token')
}

async function gh(path, token) {
  const res = await fetch(`https://api.github.com/${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`GitHub ${res.status} for ${path}`)
  return res.json()
}

// Preview deployments win over production ones; both are immutable, per-commit Vercel URLs.
async function findPreviewUrls(repo, shas, token) {
  const wanted = new Set(shas)
  const bySha = new Map()
  for (let page = 1; page <= 5 && wanted.size; page++) {
    const deployments = await gh(`repos/${repo}/deployments?per_page=100&page=${page}`, token)
    for (const d of deployments) {
      if (!wanted.has(d.sha) || !/preview|production/i.test(d.environment)) continue
      const list = bySha.get(d.sha) ?? []
      list.push(d)
      bySha.set(d.sha, list)
    }
    if (deployments.length < 100) break
  }

  const urls = new Map()
  let lookups = 0
  for (const [sha, list] of bySha) {
    list.sort((a, b) => Number(/preview/i.test(b.environment)) - Number(/preview/i.test(a.environment)))
    for (const d of list) {
      if (lookups++ >= MAX_STATUS_LOOKUPS) return urls
      const statuses = await gh(`repos/${repo}/deployments/${d.id}/statuses?per_page=5`, token)
      const ok = statuses.find((s) => s.state === 'success' && s.environment_url)
      if (ok) {
        urls.set(sha, ok.environment_url)
        break
      }
    }
  }
  return urls
}

async function main() {
  const existing = readExisting()
  const repo = detectRepo(existing.repo)
  const known = new Map(existing.commits.map((c) => [c.sha, c]))

  // Vercel builds from a shallow clone, so older commits are carried over from the committed file.
  const fromGit = readGitLog().map((c) => ({ ...known.get(c.sha), ...c }))
  const seen = new Set(fromGit.map((c) => c.sha))
  const merged = [...fromGit, ...existing.commits.filter((c) => !seen.has(c.sha))]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, MAX_COMMITS)

  const { VERCEL_GIT_COMMIT_SHA: buildSha, VERCEL_URL: buildUrl } = process.env
  if (buildSha && buildUrl) {
    const current = merged.find((c) => c.sha === buildSha)
    if (current) current.previewUrl = `https://${buildUrl}`
  }

  const missing = merged.filter((c) => !c.previewUrl).map((c) => c.sha)
  if (repo && missing.length) {
    try {
      const urls = await findPreviewUrls(repo, missing, githubToken())
      merged.forEach((c) => {
        if (urls.has(c.sha)) c.previewUrl = urls.get(c.sha)
      })
    } catch (err) {
      console.warn(`[version-history] preview lookup skipped: ${err.message}`)
    }
  }

  const commits = merged.map(({ sha, subject, date, author, previewUrl }) => {
    const pr = subject.match(/\(#(\d+)\)\s*$/)?.[1]
    return {
      sha,
      subject: pr ? subject.replace(/\s*\(#\d+\)\s*$/, '') : subject,
      date,
      author,
      previewUrl: previewUrl ?? null,
      prUrl: pr && repo ? `https://github.com/${repo}/pull/${pr}` : null,
      commitUrl: repo ? `https://github.com/${repo}/commit/${sha}` : null,
    }
  })

  const next = `${JSON.stringify({ repo, commits }, null, 2)}\n`
  const prev = existsSync(OUT) ? readFileSync(OUT, 'utf8') : ''
  if (next !== prev) writeFileSync(OUT, next)
  const linked = commits.filter((c) => c.previewUrl).length
  console.log(`[version-history] ${commits.length} commits, ${linked} with preview links`)
}

main().catch((err) => {
  console.warn(`[version-history] skipped: ${err.message}`)
})
