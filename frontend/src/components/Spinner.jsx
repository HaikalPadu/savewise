import './Spinner.css'

/** Simple loading indicator. `label` is read out by screen readers. */
export default function Spinner({ label = 'Loading...', inline = false }) {
  return (
    <div className={inline ? 'spinner spinner--inline' : 'spinner'} role="status">
      <span className="spinner__circle" aria-hidden="true" />
      <span className={inline ? 'sr-only' : 'spinner__label'}>{label}</span>
    </div>
  )
}
