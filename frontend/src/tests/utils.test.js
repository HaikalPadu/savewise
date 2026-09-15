import { describe, expect, it } from 'vitest'
import { formatRM, toNumber } from '../utils/currency'
import { getGoalProgress, getTotals } from '../utils/goals'

describe('currency helpers', () => {
  it('parses the two-decimal strings returned by the API', () => {
    expect(toNumber('4000.00')).toBe(4000)
    expect(toNumber(250.5)).toBe(250.5)
    expect(toNumber(null)).toBe(0)
    expect(toNumber('abc')).toBe(0)
  })

  it('formats amounts in RM with thousands separators', () => {
    expect(formatRM('4000.00')).toBe('RM 4,000.00')
    expect(formatRM('0.00')).toBe('RM 0.00')
    expect(formatRM(1234567.5)).toBe('RM 1,234,567.50')
  })
})

describe('getGoalProgress', () => {
  it('works out remaining amount and percentage', () => {
    const progress = getGoalProgress({ target_amount: '4000.00', saved_amount: '1000.00' })

    expect(progress.target).toBe(4000)
    expect(progress.saved).toBe(1000)
    expect(progress.remaining).toBe(3000)
    expect(progress.percentage).toBe(25)
    expect(progress.isComplete).toBe(false)
  })

  it('flags a fully funded goal', () => {
    const progress = getGoalProgress({ target_amount: '500.00', saved_amount: '500.00' })

    expect(progress.remaining).toBe(0)
    expect(progress.percentage).toBe(100)
    expect(progress.isComplete).toBe(true)
  })

  it('never returns negative remaining or over 100%', () => {
    const progress = getGoalProgress({ target_amount: '100.00', saved_amount: '150.00' })

    expect(progress.remaining).toBe(0)
    expect(progress.percentage).toBe(100)
  })

  it('handles missing data safely', () => {
    expect(getGoalProgress(undefined)).toEqual({
      target: 0,
      saved: 0,
      remaining: 0,
      percentage: 0,
      isComplete: false,
    })
  })
})

describe('getTotals', () => {
  it('sums every goal', () => {
    const totals = getTotals([
      { target_amount: '4000.00', saved_amount: '1000.00' },
      { target_amount: '1000.00', saved_amount: '500.00' },
    ])

    expect(totals).toEqual({
      count: 2,
      target: 5000,
      saved: 1500,
      remaining: 3500,
      percentage: 30,
    })
  })

  it('returns zeroes for an empty list', () => {
    expect(getTotals([])).toEqual({
      count: 0,
      target: 0,
      saved: 0,
      remaining: 0,
      percentage: 0,
    })
  })
})
