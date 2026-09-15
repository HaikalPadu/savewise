import { useCallback, useEffect, useState } from 'react'
import EmptyState from './components/EmptyState'
import GoalCard from './components/GoalCard'
import GoalForm from './components/GoalForm'
import Message from './components/Message'
import Spinner from './components/Spinner'
import SummaryBar from './components/SummaryBar'
import * as goalsApi from './api/goals'
import { formatRM } from './utils/currency'
import './App.css'

export default function App() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [notice, setNotice] = useState('')

  const loadGoals = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      setGoals(await goalsApi.fetchGoals())
    } catch (error) {
      setLoadError(error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadGoals()
  }, [loadGoals])

  // The forms below surface their own field errors, so these handlers
  // re-throw and only deal with the happy path.
  async function handleCreateGoal(values) {
    const created = await goalsApi.createGoal(values)
    setGoals((current) => [...current, created])
    setNotice(`Goal "${created.name}" created.`)
  }

  async function handleAddSavings(goalId, amount) {
    const updated = await goalsApi.addSavings(goalId, amount)
    setGoals((current) => current.map((goal) => (goal.id === updated.id ? updated : goal)))
    setNotice(`${formatRM(amount)} added to "${updated.name}".`)
  }

  async function handleDeleteGoal(goalId) {
    const removed = goals.find((goal) => goal.id === goalId)
    await goalsApi.deleteGoal(goalId)
    setGoals((current) => current.filter((goal) => goal.id !== goalId))
    setNotice(removed ? `Goal "${removed.name}" deleted.` : 'Goal deleted.')
  }

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-inner">
          <p className="app__logo">SaveWise</p>
          <p className="app__tagline">Track your personal savings goals</p>
        </div>
      </header>

      <main className="app__main">
        <SummaryBar goals={goals} />

        <GoalForm onCreate={handleCreateGoal} />

        {notice && (
          <Message type="success" onDismiss={() => setNotice('')}>
            {notice}
          </Message>
        )}

        <section className="app__goals" aria-label="Savings goals">
          <div className="app__goals-header">
            <h2 className="app__section-title">Your savings goals</h2>
            {!loading && !loadError && goals.length > 0 && (
              <button type="button" className="button button--ghost" onClick={loadGoals}>
                Refresh
              </button>
            )}
          </div>

          {loading && <Spinner label="Loading your savings goals..." />}

          {!loading && loadError && (
            <Message type="error" onRetry={loadGoals}>
              {loadError}
            </Message>
          )}

          {!loading && !loadError && goals.length === 0 && <EmptyState />}

          {!loading && !loadError && goals.length > 0 && (
            <div className="goal-grid">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onAddSavings={handleAddSavings}
                  onDelete={handleDeleteGoal}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="app__footer">
        <p>SaveWise &middot; amounts shown in Ringgit Malaysia (RM)</p>
      </footer>
    </div>
  )
}
