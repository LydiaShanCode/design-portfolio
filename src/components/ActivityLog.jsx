import { useEffect, useState } from 'react'

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTPY6pk7hcjpXCTIuNj1N98xJmSNIBnM8g0qLoQSLEnq9bPBxfrL4m1ri1QE34SckjmmY8TbhCGPykg/pub?output=csv'

function parseCSV(csv) {
  const lines = csv.split('\n')
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  
  return lines.slice(1).filter(line => line.trim()).map(line => {
    // Handle commas inside quoted strings
    const values = []
    let current = ''
    let inQuotes = false
    
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())
    
    const row = {}
    headers.forEach((header, i) => {
      row[header] = values[i] || ''
    })
    return row
  })
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateShort(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

const ArrowUpRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-4 h-4"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
    />
  </svg>
)

const DocumentIcon = ({ className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={`w-5 h-5 ${className}`}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
    />
  </svg>
)

const DocumentTextIcon = ({ className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={`w-5 h-5 ${className}`}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
    />
  </svg>
)

function ActivityLog() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(SHEET_URL)
      .then(res => res.text())
      .then(csv => {
        const data = parseCSV(csv)
    // Sort by date (newest first)
        const sorted = data.sort((a, b) => {
          const dateA = new Date(a.Date || 0)
          const dateB = new Date(b.Date || 0)
          return dateB - dateA
    })
    setActivities(sorted)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch activities:', err)
        setError('Failed to load activities')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <section id="activity-log" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center">
            <span className="loader" />
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="activity-log" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto text-center text-gray-500">
          {error}
        </div>
      </section>
    )
  }

  return (
    <section id="activity-log" className="pt-10 pb-4 lg:py-20 px-4 bg-white overflow-x-hidden">
      <div className="max-w-6xl mx-auto w-full">
        {/* Top divider - desktop only */}
        <div className="hidden lg:block border-t border-dashed border-current opacity-20 mb-12" />
        
        <div className="flex flex-col lg:flex-row lg:gap-12">
          {/* Left heading */}
          <h2 className="hidden lg:block text-3xl font-heading font-light lg:w-64 lg:flex-shrink-0">
            RECENT ACTIVITIES
          </h2>
          
          {/* Activity list */}
          <div className="flex-1 rounded-2xl border border-dashed border-current/20 p-4 lg:rounded-none lg:border-0 lg:p-0">
            <p className="lg:hidden text-xs uppercase opacity-50 mb-3" style={{ letterSpacing: '-1px' }}>
              Recently...
            </p>
            {activities.map((activity, index) => {
              const tags = activity.Tags ? activity.Tags.split(',').map(t => t.trim()).filter(Boolean) : []
              const hasLink = activity.Link && activity.Link.trim()
              
              const rowContent = (
                <div className="py-3 text-xs overflow-hidden flex flex-col gap-2 lg:grid lg:grid-cols-[minmax(0,1.7fr)_140px_220px_120px_20px] lg:items-center lg:gap-x-6">
                  {/* Icon + Group + Event */}
                  <div className="flex items-start lg:items-center gap-3 min-w-0">
                    <span className="hidden lg:block flex-shrink-0 relative mt-0.5 lg:mt-0">
                      <DocumentIcon className="group-hover:opacity-0 transition-opacity duration-200" />
                      <DocumentTextIcon className="absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </span>
                    <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
                      <span className="min-w-0 break-words">
                        {activity['Name of group'] && <span className="font-bold">{activity['Name of group']}, </span>}
                        {activity['Community/Event'] || activity.Event || 'Untitled'}
                      </span>
                      <span className="flex flex-shrink-0 items-center gap-2 text-right whitespace-nowrap lg:hidden">
                        <span>{formatDateShort(activity.Date)}</span>
                        {hasLink && <ArrowUpRightIcon />}
                      </span>
                    </div>
                  </div>
                  
                  {/* Role */}
                  <div className="hidden lg:block pl-8 lg:pl-0">
                    {activity.Role || ''}
                  </div>
                  
                  {/* Tags */}
                  <div className="hidden lg:flex flex-wrap items-center gap-2 pl-8 lg:pl-0">
                    {tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="inline-flex items-center rounded-full border border-dashed border-gray-300 px-[10px] py-1 text-[12px] font-medium whitespace-nowrap"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Date */}
                  <div className="hidden lg:block pl-8 lg:pl-0 lg:text-right">
                    {formatDate(activity.Date)}
                  </div>
                  
                  {/* Arrow */}
                  <div className="hidden lg:flex items-center justify-center">
                    {hasLink && <ArrowUpRightIcon />}
                  </div>
                </div>
              )
              
              return (
                <div key={index}>
                  {hasLink ? (
                    <a
                      href={activity.Link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block hover:bg-gray-50 transition-colors duration-200 -mx-4 px-4 rounded-xl"
                      data-hoverable
                    >
                      {rowContent}
                    </a>
                  ) : (
                    <div className="group -mx-4 px-4 rounded-xl">
                      {rowContent}
                </div>
              )}
            </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ActivityLog
