import { useState } from 'react'
import Spinner from './Spinner'
import './GoalForm.css'

/**
 * Form for creating a new savings goal (POST /api/goals).
 * `onCreate` receives { name, targetAmount } and resolves when the API call
 * succeeds, or rejects with an ApiError.
 */
export default function GoalForm({ onCreate }) {
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  // Basic checks before we bother the server. The backend validates too.
  function validate() {
    const nextErrors = {}

    if (!name.trim()) {
      nextErrors.name = 'Please enter a goal name.'
    } else if (name.trim().length > 255) {
      nextErrors.name = 'Goal name must be 255 characters or fewer.'
    }

    const amount = Number(targetAmount)
    if (targetAmount === '') {
      nextErrors.target_amount = 'Please enter a target amount.'
    } else if (!Number.isFinite(amount) || amount <= 0) {
      nextErrors.target_amount = 'Target amount must be greater than 0.'
    }

    return nextErrors
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')

    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSaving(true)
    try {
      await onCreate({ name: name.trim(), targetAmount: Number(targetAmount) })
      setName('')
      setTargetAmount('')
      setErrors({})
    } catch (error) {
      setErrors({
        name: error.fieldError?.('name'),
        target_amount: error.fieldError?.('target_amount'),
      })
      setFormError(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="goal-form card" onSubmit={handleSubmit} noValidate>
      <h2 className="goal-form__title">Create a savings goal</h2>

      <div className="goal-form__fields">
        <div className="field">
          <label htmlFor="goal-name">Goal name</label>
          <input
            id="goal-name"
            type="text"
            placeholder="e.g. New Laptop"
            value={name}
            maxLength={255}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <p className="field__error">{errors.name}</p>}
        </div>

        <div className="field">
          <label htmlFor="goal-target">Target amount (RM)</label>
          <input
            id="goal-target"
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            placeholder="e.g. 4000.00"
            value={targetAmount}
            onChange={(event) => setTargetAmount(event.target.value)}
            aria-invalid={Boolean(errors.target_amount)}
          />
          {errors.target_amount && <p className="field__error">{errors.target_amount}</p>}
        </div>

        <button type="submit" className="button button--primary" disabled={saving}>
          {saving ? <Spinner inline label="Saving goal" /> : null}
          {saving ? 'Saving...' : 'Add goal'}
        </button>
      </div>

      {formError && (
        <p className="goal-form__error" role="alert">
          {formError}
        </p>
      )}
    </form>
  )
}
