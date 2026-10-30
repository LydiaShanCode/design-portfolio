// Placeholder data shaped like the real playItems in src/components/Play.jsx.
// Includes a long title (Shader) and a missing-year case (Text Scrub).
const PLAY_ITEMS = [
  { title: 'Listening Room', year: '2026', type: 'Three.js Experiment', span: 'span-12', img: 'assets/listening-room.jpg' },
  { title: 'DJ Simulator', year: '2026', type: 'Interactive', span: 'span-8', img: 'assets/dj.jpg' },
  { title: 'Shader Experiment One', year: '2026', type: 'Shader', span: 'span-4', img: 'assets/shader.jpg' },
  { title: 'Text Scrub Animation', year: '', type: 'Interaction', span: 'span-6', placeholder: 'scrub' },
  { title: 'Koi Fish', year: '2025', type: 'Animation', span: 'span-6', placeholder: 'koi' },
]

const KOI = `      .-~~~-.
  .-~       ~-.  ><(((º>
 (   ~~~~~~~   )
  '-._______.-'`

function previewMarkup(item) {
  if (item.img) return `<img src="${item.img}" alt="" />`
  if (item.placeholder === 'koi') return `<div class="koi-placeholder">${KOI}</div>`
  return `<div class="scrub-placeholder">hover to scrub</div>`
}

// Each version supplies renderLabel(item) returning the label markup inside the card,
// and optionally renderAfter(item) for markup outside the card's clipped frame.
function renderGrid({ renderLabel, renderAfter }) {
  if (new URLSearchParams(location.search).get('hover') === '1') {
    document.body.classList.add('force-hover')
  }
  const grid = document.querySelector('.play-grid')
  grid.innerHTML = PLAY_ITEMS.map((item) => {
    const card = `
      <button class="play-card ${renderAfter ? '' : item.span}" type="button">
        <div class="play-card-preview">${previewMarkup(item)}</div>
        ${renderLabel ? renderLabel(item) : ''}
      </button>`
    if (!renderAfter) return card
    return `<div class="play-item ${item.span}">${card}${renderAfter(item)}</div>`
  }).join('')
}
