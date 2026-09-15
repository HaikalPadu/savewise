import './Message.css'

/**
 * Error or success banner.
 * `onRetry` adds a retry button, `onDismiss` adds a close button.
 */
export default function Message({ type = 'error', children, onRetry, onDismiss }) {
  if (!children) return null

  return (
    <div className={`message message--${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <span className="message__icon" aria-hidden="true">
        {type === 'error' ? '!' : '✓'}
      </span>
      <p className="message__text">{children}</p>

      {onRetry && (
        <button type="button" className="message__action" onClick={onRetry}>
          Try again
        </button>
      )}

      {onDismiss && (
        <button
          type="button"
          className="message__close"
          onClick={onDismiss}
          aria-label="Dismiss message"
        >
          ×
        </button>
      )}
    </div>
  )
}
