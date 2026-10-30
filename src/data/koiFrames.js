// Bundled as one lazy chunk: 198 tiny files otherwise cost 198 requests on first paint
const modules = import.meta.glob('../assets/koi-frames/frame-*.txt', { query: '?raw', import: 'default', eager: true })

export default Object.keys(modules).sort().map((key) => modules[key])
