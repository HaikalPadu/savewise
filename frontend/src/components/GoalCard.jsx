import { useState } from 'react'
import AddSavingsForm from './AddSavingsForm'
import Spinner from './Spinner'
import { formatRM } from '../utils/currency'
import { getGoalProgress } from '../utils/goals'
import './GoalCard.css'

/** One savings goal: amounts, progress, add-savings form and delete button. */
export default function GoalCard({ goal, onAddSavings, onDelete }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const { target, saved, remaining, percentage, isComplete } = getGoalProgress(goal)

  async function handleDelete() {
    setDeleteError('')
    setDeleting(true)
    try {
      await onDelete(goal.id)
    } catch (error) {
      setDeleteError(error.message)
      setDeleting(false)
      setConfirmingDelete(false)
    }
  }

  return (
    <article className={`goal-card card${isComplete ? ' goal-card--complete' : ''}`}>
      <header className="goal-card__header">
        <h3 className="goal-card__name">{goal.name}</h3>
        {isComplete && <span className="badge badge--success">Completed</span>}
      </header>

      <div className="goal-card__progress">
        <div
          className="goal-card__bar"
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${goal.name} progress`}
        >
          <div className="goal-card__bar-fill" style={{ width: `${percentage}%` }} />
        </div>
        <p className="goal-card__percentage">{percentage}% saved</p>
      </div>

      <dl className="goal-card__amounts">
        <div>
          <dt>Target</dt>
          <dd>{formatRM(target)}</dd>
        </div>
        <div>
          <dt>Saved</dt>
          <dd className="goal-card__amount--saved">{formatRM(saved)}</dd>
        </div>
        <div>
          <dt>Remaining</dt>
          <dd className="goal-card__amount--remaining">{formatRM(remaining)}</dd>
        </div>
      </dl>

      <AddSavingsForm
        goalId={goal.id}
        remaining={remaining}
        disabled={deleting}
        onAdd={(amount) => onAddSavings(goal.id, amount)}
      />

      <footer className="goal-card__footer">
        {confirmingDelete ? (
          <div className="goal-card__confirm">
            <span>Delete this goal?</span>
            <button
              type="button"
              className="button button--danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? <Spinner inline label="Deleting goal" /> : null}
              {deleting ? 'Deleting...' : 'Yes, delete'}
            </button>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => setConfirmingDelete(false)}
              disabled={deleting}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="button button--ghost-danger"
            onClick={() => setConfirmingDelete(true)}
          >
            Delete goal
          </button>
        )}
      </footer>

      {deleteError && (
        <p className="field__error" role="alert">
          {deleteError}
        </p>
      )}
    </article>
  )
}
