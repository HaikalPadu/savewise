// Every function here maps to one endpoint from docs/API.md.
import { request } from './client'

/** GET /api/goals -> array of goals */
export async function fetchGoals() {
  const body = await request('/goals')
  return body?.data ?? []
}

/** POST /api/goals -> created goal */
export async function createGoal({ name, targetAmount }) {
  const body = await request('/goals', {
    method: 'POST',
    body: { name, target_amount: targetAmount },
  })
  return body?.data
}

/** PUT /api/goals/{id}/add-savings -> updated goal */
export async function addSavings(goalId, amount) {
  const body = await request(`/goals/${goalId}/add-savings`, {
    method: 'PUT',
    body: { amount },
  })
  return body?.data
}

/** DELETE /api/goals/{id} -> no content */
export async function deleteGoal(goalId) {
  await request(`/goals/${goalId}`, { method: 'DELETE' })
}
