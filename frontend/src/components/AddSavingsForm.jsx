import { useState } from 'react'
import Spinner from './Spinner'

/**
 * Inline form on each card for PUT /api/goals/{id}/add-savings.
 * `onAdd(amount)` resolves on success or rejects with an ApiError.
 */
export default function AddSavingsForm({ goalId, remaining, disabled = false, onAdd }) {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const isComplete = remaining <= 0
  const inputId = `add-savings-${goalId}`

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const value = Number(amount)
    if (amount === '') {
      setError('Please enter an amount.')
      return
    }
    if (!Number.isFinite(value) || value <= 0) {
      setError('Amount must be greater than 0.')
      return
    }
    if (value > remaining) {
      setError(`You can only add up to RM ${remaining.toFixed(2)} to this goal.`)
      return
    }

    setSaving(true)
    try {
      await onAdd(value)
      setAmount('')
    } catch (apiError) {
      setError(apiError.fieldError?.('amount') || apiError.message)
    } finally {
      setSaving(false)
    }
  }

  if (isComplete) {
    return (
      <p className="goal-card__done">🎉 Goal reached. Nothing left to save!</p>
    )
  }

  return (
    <form className="add-savings" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor={inputId}>Add savings (RM)</label>
        <div className="add-savings__row">
          <input
            id={inputId}
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={amount}
            disabled={disabled || saving}
            onChange={(event) => setAmount(event.target.value)}
            aria-invalid={Boolean(error)}
          />
          <button type="submit" className="button button--secondary" disabled={disabled || saving}>
            {saving ? <Spinner inline label="Adding savings" /> : null}
            {saving ? 'Adding...' : 'Add'}
          </button>
        </div>
        {error && <p className="field__error">{error}</p>}
      </div>
    </form>
  )
}
