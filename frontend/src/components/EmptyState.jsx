import './EmptyState.css'

/** Shown when the API returns no savings goals yet. */
export default function EmptyState() {
  return (
    <div className="empty-state card">
      <span className="empty-state__icon" aria-hidden="true">
        🎯
      </span>
      <h2 className="empty-state__title">No savings goals yet</h2>
      <p className="empty-state__text">
        Use the form above to create your first goal. Give it a name and a target amount in RM,
        then add savings as you go.
      </p>
    </div>
  )
}
