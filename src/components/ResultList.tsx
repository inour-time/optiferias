import { Scenario } from '../engine/types'
import ResultCard from './ResultCard'
import './ResultList.css'

interface ResultListProps {
  scenarios: Scenario[]
  onSelect: (rank: number) => void
}

export default function ResultList({ scenarios, onSelect }: ResultListProps) {
  if (scenarios.length === 0) return null

  return (
    <div className="rl-grid">
      {scenarios.map((s) => (
        <ResultCard
          key={`${s.rank}-${s.splitLabel}`}
          rank={s.rank}
          splitLabel={s.splitLabel}
          totalBreakDays={s.totalBreakDays}
          vacationDaysSpent={s.vacationDaysSpent}
          efficiency={s.totalEfficiency}
          period1={s.period1}
          period2={s.period2}
          onSelect={onSelect}
          sellDays={s.sellDays}
          keepDays={s.keepDays}
          keepDeadline={s.keepDeadline}
        />
      ))}
    </div>
  )
}