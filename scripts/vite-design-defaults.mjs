import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const FILE = resolve(process.cwd(), 'src/data/designDefaults.json')
const KEY = /^[a-z][a-z0-9-]*$/i
const VALUE = /^[a-z0-9][a-z0-9._-]*$/i

function readBody(req) {
  return new Promise((resolveBody, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolveBody(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function normalize(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Defaults must be an object of id → version key.')
  }
  const out = {}
  for (const [id, key] of Object.entries(raw)) {
    if (!KEY.test(id) || typeof key !== 'string' || !VALUE.test(key)) {
      throw new Error(`Invalid default "${id}: ${key}".`)
    }
    out[id] = key
  }
  return out
}

// Dev-only POST /__design-defaults writes the shipped mix that production uses
// when the version switcher is hidden.
export function designDefaultsApi() {
  return {
    name: 'design-defaults-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__design-defaults', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        try {
          const defaults = normalize(JSON.parse(await readBody(req) || '{}'))
          await writeFile(FILE, `${JSON.stringify(defaults, null, 2)}\n`)
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(defaults))
        } catch (err) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err.message }))
        }
      })
    },
  }
}
