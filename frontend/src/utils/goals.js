import { toNumber } from './currency'

/**
 * Works out the numbers a goal card needs to display.
 * All values are plain numbers so the UI never does maths on strings.
 */
export function getGoalProgress(goal) {
  const target = toNumber(goal?.target_amount)
  const saved = toNumber(goal?.saved_amount)
  const remaining = Math.max(target - saved, 0)
  const percentage = target > 0 ? Math.min((saved / target) * 100, 100) : 0

  return {
    target,
    saved,
    remaining,
    percentage: Math.round(percentage),
    isComplete: target > 0 && remaining === 0,
  }
}

/** Totals across every goal, used by the dashboard summary. */
export function getTotals(goals) {
  const totals = goals.reduce(
    (acc, goal) => {
      const { target, saved } = getGoalProgress(goal)
      return { target: acc.target + target, saved: acc.saved + saved }
    },
    { target: 0, saved: 0 },
  )

  const remaining = Math.max(totals.target - totals.saved, 0)
  const percentage = totals.target > 0 ? Math.min((totals.saved / totals.target) * 100, 100) : 0

  return {
    count: goals.length,
    target: totals.target,
    saved: totals.saved,
    remaining,
    percentage: Math.round(percentage),
  }
}
