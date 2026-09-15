import { formatRM } from '../utils/currency'
import { getTotals } from '../utils/goals'
import './SummaryBar.css'

/** Dashboard totals across every savings goal. */
export default function SummaryBar({ goals }) {
  const totals = getTotals(goals)

  const items = [
    { label: 'Goals', value: String(totals.count) },
    { label: 'Total target', value: formatRM(totals.target) },
    { label: 'Total saved', value: formatRM(totals.saved) },
    { label: 'Total remaining', value: formatRM(totals.remaining) },
    { label: 'Overall progress', value: `${totals.percentage}%` },
  ]

  return (
    <section className="summary" aria-label="Savings summary">
      {items.map((item) => (
        <div className="summary__item card" key={item.label}>
          <p className="summary__label">{item.label}</p>
          <p className="summary__value">{item.value}</p>
        </div>
      ))}
    </section>
  )
}
