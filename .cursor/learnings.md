# Learnings

Captured debugging insights and gotchas for this project.

---

## Markdown image/video references with special characters

**Date:** 2026-03-20

**Problem:** Videos and images referenced in `project.md` files via standard markdown image syntax `![alt](./filename)` failed to render for two reasons:

1. **Parentheses in filenames break markdown parsing.** Markdown uses `()` to delimit the URL in `![alt](url)`, so a filename like `payouts uplift audit video (1).MP4` causes the parser to see `(1)` as the end of the URL.

   **Fix:** Wrap the URL in angle brackets: `![alt](<./filename with (parens).MP4>)`. This is standard markdown syntax for URLs containing special characters.

2. **URL-encoded paths don't match Vite glob keys.** The markdown parser URL-encodes the `src` attribute (spaces → `%20`, parens → `%28`/`%29`), but `import.meta.glob` keys use literal characters. So `resolveProjectAsset` couldn't find a match.

   **Fix:** Apply `decodeURIComponent()` to the filename before matching against glob keys.

**Files affected:** `src/components/ProjectPage.jsx`, `src/assets/projects/*/project.md`

**Takeaway:** When referencing assets with spaces or special characters from markdown files processed by react-markdown, always use angle-bracket URL syntax in the markdown and `decodeURIComponent()` on the resolved `src` before matching against Vite's glob module keys.
