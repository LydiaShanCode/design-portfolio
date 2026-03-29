import { useState, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

function Resume() {
  const [numPages, setNumPages] = useState(null)
  const [containerWidth, setContainerWidth] = useState(null)

  const containerRef = useCallback((node) => {
    if (node) {
      const ro = new ResizeObserver(([entry]) => {
        setContainerWidth(entry.contentRect.width)
      })
      ro.observe(node)
    }
  }, [])

  return (
    <main className="resume-page">
      <div className="resume-shell">
        <header className="resume-header" style={{ justifyContent: 'flex-end' }}>
          <div className="resume-actions">
            <a
              href="/resume.pdf"
              download
              className="resume-action"
              data-hoverable
              aria-label="Download resume PDF"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </a>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="resume-action"
              data-hoverable
              aria-label="View resume PDF"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
            </a>
          </div>
        </header>
        <div className="resume-pages" ref={containerRef}>
          <Document
            file="/resume.pdf"
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={null}
          >
            {numPages && Array.from({ length: numPages }, (_, i) => (
              <div key={i} className="resume-page-card">
                <Page
                  pageNumber={i + 1}
                  width={containerWidth || undefined}
                  renderAnnotationLayer
                  renderTextLayer
                />
              </div>
            ))}
          </Document>
        </div>
      </div>
    </main>
  )
}

export default Resume
