/**
 * End-to-end check: renders the real UI against a running backend.
 *
 * Start both servers first, then run `npm test`:
 *   backend/  php artisan serve
 *   frontend/ npm run dev
 *
 * If the API is not reachable these tests are skipped, so `npm test` still
 * passes on a machine where only the frontend is set up.
 */
import { afterAll, describe, expect, it } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import * as goalsApi from '../api/goals'

const ORIGIN = process.env.SAVEWISE_E2E_ORIGIN || 'http://localhost:5173'
const GOAL_NAME = `E2E Goal ${Date.now()}`

// The app calls relative URLs (/api/...). Node's fetch needs absolute ones,
// so point relative requests at the running dev server.
const nodeFetch = globalThis.fetch
globalThis.fetch = (url, options) =>
  nodeFetch(typeof url === 'string' && url.startsWith('/') ? `${ORIGIN}${url}` : url, options)

const apiIsUp = await nodeFetch(`${ORIGIN}/api/goals`, { headers: { Accept: 'application/json' } })
  .then((response) => response.ok)
  .catch(() => false)

if (!apiIsUp) {
  console.warn(`[liveApi] ${ORIGIN}/api/goals is not reachable - skipping live backend tests.`)
}

/** Reads one amount from a card, e.g. amountOn(card, 'Remaining'). */
function amountOn(card, label) {
  return within(card).getByText(label).nextElementSibling.textContent
}

// Leave the database exactly as we found it.
afterAll(async () => {
  if (!apiIsUp) return
  const goals = await goalsApi.fetchGoals()
  for (const goal of goals.filter((item) => item.name === GOAL_NAME)) {
    await goalsApi.deleteGoal(goal.id)
  }
})

describe.skipIf(!apiIsUp)('live backend', () => {
  it('creates, funds and deletes a goal through the real API', async () => {
    render(<App />)
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument(), {
      timeout: 5000,
    })

    // Create -> POST /api/goals
    await userEvent.type(screen.getByLabelText('Goal name'), GOAL_NAME)
    await userEvent.type(screen.getByLabelText('Target amount (RM)'), '4000')
    await userEvent.click(screen.getByRole('button', { name: 'Add goal' }))

    const heading = await screen.findByRole('heading', { name: GOAL_NAME }, { timeout: 5000 })
    const card = heading.closest('article')
    expect(amountOn(card, 'Target')).toBe('RM 4,000.00')
    expect(amountOn(card, 'Saved')).toBe('RM 0.00')
    expect(amountOn(card, 'Remaining')).toBe('RM 4,000.00')
    expect(within(card).getByText('0% saved')).toBeInTheDocument()

    // Add savings -> PUT /api/goals/{id}/add-savings
    await userEvent.type(within(card).getByLabelText('Add savings (RM)'), '1000')
    await userEvent.click(within(card).getByRole('button', { name: 'Add' }))

    await waitFor(() => expect(within(card).getByText('25% saved')).toBeInTheDocument(), {
      timeout: 5000,
    })
    expect(amountOn(card, 'Saved')).toBe('RM 1,000.00')
    expect(amountOn(card, 'Remaining')).toBe('RM 3,000.00')

    // Delete -> DELETE /api/goals/{id}
    await userEvent.click(within(card).getByRole('button', { name: 'Delete goal' }))
    await userEvent.click(within(card).getByRole('button', { name: 'Yes, delete' }))

    await waitFor(
      () => expect(screen.queryByRole('heading', { name: GOAL_NAME })).not.toBeInTheDocument(),
      { timeout: 5000 },
    )
  })

  it('surfaces the backend 422 when an amount would exceed the target', async () => {
    const goal = await goalsApi.createGoal({ name: GOAL_NAME, targetAmount: 100 })

    // The API layer turns the backend's 422 into a field error the forms show.
    await expect(goalsApi.addSavings(goal.id, 500)).rejects.toMatchObject({
      status: 422,
      fieldErrors: { amount: expect.any(Array) },
    })

    // The card also refuses the same amount before it reaches the server.
    render(<App />)
    const heading = await screen.findByRole('heading', { name: GOAL_NAME }, { timeout: 5000 })
    const card = heading.closest('article')

    await userEvent.type(within(card).getByLabelText('Add savings (RM)'), '500')
    await userEvent.click(within(card).getByRole('button', { name: 'Add' }))
    expect(
      within(card).getByText('You can only add up to RM 100.00 to this goal.'),
    ).toBeInTheDocument()

    await goalsApi.deleteGoal(goal.id)
  })
})
