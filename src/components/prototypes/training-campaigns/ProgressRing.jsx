const RADIUS = 18.08

export default function ProgressRing({ completed, overdue, total }) {
  const completedShare = total ? (completed / total) * 100 : 0
  const overdueShare = total ? (overdue / total) * 100 : 0

  return (
    <svg className="tc-ring" viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
      <g transform="rotate(-90 20 20)">
        <circle className="tc-ring__track" cx="20" cy="20" r={RADIUS} pathLength="100" />
        {overdueShare > 0 ? (
          <circle
            className="tc-ring__arc tc-ring__arc--overdue"
            cx="20"
            cy="20"
            r={RADIUS}
            pathLength="100"
            strokeDasharray={`${overdueShare} ${100 - overdueShare}`}
          />
        ) : null}
        {completedShare > 0 ? (
          <circle
            className="tc-ring__arc tc-ring__arc--completed"
            cx="20"
            cy="20"
            r={RADIUS}
            pathLength="100"
            strokeDasharray={`${completedShare} ${100 - completedShare}`}
            strokeDashoffset={-overdueShare}
          />
        ) : null}
      </g>
    </svg>
  )
}
