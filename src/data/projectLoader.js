import yaml from 'js-yaml'

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { data: {}, content: raw }
  const data = yaml.load(match[1]) || {}
  const content = match[2]
  return { data, content }
}

const modules = import.meta.glob('../assets/projects/*/project.md', {
  query: '?raw',
  eager: true,
})

const projects = Object.values(modules)
  .map((mod) => {
    const raw = typeof mod === 'string' ? mod : mod.default
    const { data, content } = parseFrontmatter(raw)
    const stripped = content.replace(/<!--[\s\S]*?-->/g, '')
    return { ...data, content: stripped.trim() }
  })
  .sort((a, b) => a.id - b.id)

export default projects
