import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

/** Builds a minimal Response-like object for the fetch mock. */
function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => (body === null ? '' : JSON.stringify(body)),
  }
}

function goal(overrides = {}) {
  return {
    id: 1,
    name: 'New Laptop',
    target_amount: '4000.00',
    saved_amount: '1000.00',
    created_at: '2026-09-15T00:00:00.000000Z',
    updated_at: '2026-09-15T00:00:00.000000Z',
    ...overrides,
  }
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('App', () => {
  it('shows a loading state, then the goals returned by GET /api/goals', async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse({ data: [goal()] }))

    render(<App />)

    expect(screen.getByText('Loading your savings goals...')).toBeInTheDocument()

    expect(await screen.findByRole('heading', { name: 'New Laptop' })).toBeInTheDocument()
    expect(global.fetch).toHaveBeenCalledWith('/api/goals', expect.objectContaining({ method: 'GET' }))

    const card = screen.getByRole('article')
    expect(within(card).getByText('RM 4,000.00')).toBeInTheDocument() // target
    expect(within(card).getByText('RM 1,000.00')).toBeInTheDocument() // saved
    expect(within(card).getByText('RM 3,000.00')).toBeInTheDocument() // remaining
    expect(within(card).getByText('25% saved')).toBeInTheDocument()
  })

  it('shows the empty state when there are no goals', async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse({ data: [] }))

    render(<App />)

    expect(await screen.findByText('No savings goals yet')).toBeInTheDocument()
  })

  it('shows an error message with a retry button when loading fails', async () => {
    global.fetch = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(jsonResponse({ data: [] }))

    render(<App />)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Cannot reach the server')

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await screen.findByText('No savings goals yet')).toBeInTheDocument()
  })

  it('creates a goal through POST /api/goals', async () => {
    const created = goal({ id: 2, name: 'Emergency Fund', target_amount: '5000.00', saved_amount: '0.00' })
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ data: [] }))
      .mockResolvedValueOnce(jsonResponse({ data: created }, 201))

    render(<App />)
    await screen.findByText('No savings goals yet')

    await userEvent.type(screen.getByLabelText('Goal name'), 'Emergency Fund')
    await userEvent.type(screen.getByLabelText('Target amount (RM)'), '5000')
    await userEvent.click(screen.getByRole('button', { name: 'Add goal' }))

    expect(await screen.findByRole('heading', { name: 'Emergency Fund' })).toBeInTheDocument()
    expect(global.fetch).toHaveBeenLastCalledWith(
      '/api/goals',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Emergency Fund', target_amount: 5000 }),
      }),
    )
    expect(screen.getByText('Goal "Emergency Fund" created.')).toBeInTheDocument()
  })

  it('validates the create form before calling the API', async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse({ data: [] }))

    render(<App />)
    await screen.findByText('No savings goals yet')

    await userEvent.click(screen.getByRole('button', { name: 'Add goal' }))

    expect(screen.getByText('Please enter a goal name.')).toBeInTheDocument()
    expect(screen.getByText('Please enter a target amount.')).toBeInTheDocument()
    expect(global.fetch).toHaveBeenCalledTimes(1) // only the initial GET
  })

  it('adds savings through PUT /api/goals/{id}/add-savings', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ data: [goal()] }))
      .mockResolvedValueOnce(jsonResponse({ data: goal({ saved_amount: '1200.00' }) }))

    render(<App />)
    await screen.findByRole('heading', { name: 'New Laptop' })

    await userEvent.type(screen.getByLabelText('Add savings (RM)'), '200')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => expect(screen.getByText('30% saved')).toBeInTheDocument())
    expect(global.fetch).toHaveBeenLastCalledWith(
      '/api/goals/1/add-savings',
      expect.objectContaining({ method: 'PUT', body: JSON.stringify({ amount: 200 }) }),
    )
    expect(within(screen.getByRole('article')).getByText('RM 2,800.00')).toBeInTheDocument()
  })

  it('shows the API validation error when savings would exceed the target', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ data: [goal()] }))
      .mockResolvedValueOnce(
        jsonResponse(
          {
            message: 'The given data was invalid.',
            errors: { amount: ['The amount would make saved_amount exceed target_amount.'] },
          },
          422,
        ),
      )

    render(<App />)
    await screen.findByRole('heading', { name: 'New Laptop' })

    // 3000 is within the client-side limit, so the request reaches the API.
    await userEvent.type(screen.getByLabelText('Add savings (RM)'), '3000')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    expect(
      await screen.findByText('The amount would make saved_amount exceed target_amount.'),
    ).toBeInTheDocument()
    expect(screen.getByText('25% saved')).toBeInTheDocument() // unchanged
  })

  it('blocks an amount larger than the remaining amount before calling the API', async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse({ data: [goal()] }))

    render(<App />)
    await screen.findByRole('heading', { name: 'New Laptop' })

    await userEvent.type(screen.getByLabelText('Add savings (RM)'), '9999')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    expect(screen.getByText('You can only add up to RM 3000.00 to this goal.')).toBeInTheDocument()
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('deletes a goal through DELETE /api/goals/{id} after confirmation', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ data: [goal()] }))
      .mockResolvedValueOnce(jsonResponse(null, 204))

    render(<App />)
    await screen.findByRole('heading', { name: 'New Laptop' })

    await userEvent.click(screen.getByRole('button', { name: 'Delete goal' }))
    await userEvent.click(screen.getByRole('button', { name: 'Yes, delete' }))

    expect(await screen.findByText('No savings goals yet')).toBeInTheDocument()
    expect(global.fetch).toHaveBeenLastCalledWith(
      '/api/goals/1',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('keeps the goal and shows an error when deleting fails', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ data: [goal()] }))
      .mockResolvedValueOnce(
        jsonResponse({ message: 'No query results for model [App\\Models\\SavingsGoal] 1' }, 404),
      )

    render(<App />)
    await screen.findByRole('heading', { name: 'New Laptop' })

    await userEvent.click(screen.getByRole('button', { name: 'Delete goal' }))
    await userEvent.click(screen.getByRole('button', { name: 'Yes, delete' }))

    // The raw Laravel message is replaced with wording a user can act on.
    expect(
      await screen.findByText('That savings goal could not be found. It may already be deleted.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'New Laptop' })).toBeInTheDocument()
  })

  it('shows totals in RM across all goals', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      jsonResponse({
        data: [goal(), goal({ id: 2, name: 'Holiday', target_amount: '1000.00', saved_amount: '500.00' })],
      }),
    )

    render(<App />)
    await screen.findByRole('heading', { name: 'Holiday' })

    const summary = screen.getByRole('region', { name: 'Savings summary' })
    expect(within(summary).getByText('RM 5,000.00')).toBeInTheDocument() // total target
    expect(within(summary).getByText('RM 1,500.00')).toBeInTheDocument() // total saved
    expect(within(summary).getByText('RM 3,500.00')).toBeInTheDocument() // total remaining
    expect(within(summary).getByText('30%')).toBeInTheDocument()
  })

  it('shows a completed goal instead of the add savings form', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(jsonResponse({ data: [goal({ saved_amount: '4000.00' })] }))

    render(<App />)
    await screen.findByRole('heading', { name: 'New Laptop' })

    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('🎉 Goal reached. Nothing left to save!')).toBeInTheDocument()
    expect(screen.queryByLabelText('Add savings (RM)')).not.toBeInTheDocument()
  })
})
