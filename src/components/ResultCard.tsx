import { PeriodResult } from '../engine/types'
import './ResultCard.css'

function formatDate(d: Date): string {
  if (d.getTime() === 0) return ''
  const meses = [
    'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
    'jul', 'ago', 'set', 'out', 'nov', 'dez',
  ]
  const dias = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']
  return `${d.getDate()} ${meses[d.getMonth()]}, ${dias[d.getDay()]}`
}

function formatShortDate(d: Date): string {
  if (d.getTime() === 0) return ''
  const meses = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
  ]
  return `${d.getDate()} ${meses[d.getMonth()]}`
}

function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

function miniMonthBar(start: Date, length: number): { month: string; cells: string[] }[] {
  const months: { month: string; cells: string[] }[] = []
  let cur = new Date(start)

  for (let i = 0; i < length; i++) {
    const monthKey = `${cur.getFullYear()}-${cur.getMonth()}`
    let m = months.find((m) => m.month === monthKey)
    if (!m) {
      m = { month: monthKey, cells: [] }
      months.push(m)
    }
    const dayOfWeek = cur.getDay()
    m.cells.push(dayOfWeek === 0 || dayOfWeek === 6 ? '·' : '■')
    cur = new Date(cur)
    cur.setDate(cur.getDate() + 1)
  }

  return months.map((m) => {
    const parts = m.month.split('-')
    const d = new Date(Number(parts[0]), Number(parts[1]), 1)
    const nomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return { month: nomes[d.getMonth()], cells: m.cells }
  })
}

interface ResultCardProps {
  rank: number
  splitLabel: string
  totalBreakDays: number
  vacationDaysSpent: number
  efficiency: number
  period1: PeriodResult
  period2: PeriodResult
  onSelect: (rank: number) => void
}

export default function ResultCard({
  rank,
  splitLabel,
  totalBreakDays,
  vacationDaysSpent,
  efficiency,
  period1,
  period2,
  onSelect,
}: ResultCardProps) {
  const isSingle = period2.length === 0
  const daysSaved = totalBreakDays - vacationDaysSpent

  return (
    <div className="rc-card" onClick={() => onSelect(rank)}>
      <div className="rc-top">
        <span className="rc-rank">#{rank}</span>
        <span className="rc-split">{splitLabel}</span>
        <span className="rc-efficiency">
          {efficiency.toFixed(2)}x eficiência
        </span>
      </div>

      <div className="rc-metrics">
        <div className="rc-metric">
          <span className="rc-metric-value">{totalBreakDays}</span>
          <span className="rc-metric-label">dias off</span>
        </div>
        <div className="rc-metric">
          <span className="rc-metric-value">{vacationDaysSpent}</span>
          <span className="rc-metric-label">dias gastos</span>
        </div>
        <div className="rc-metric rc-metric-highlight">
          <span className="rc-metric-value">+{daysSaved}</span>
          <span className="rc-metric-label">dias extras</span>
        </div>
      </div>

      <div className="rc-periods">
        <div className="rc-period">
          <span className="rc-period-label">
            {isSingle ? 'Período único' : '1º período'}
          </span>
          <span className="rc-period-date">{formatDate(period1.startDate)}</span>
          <span className="rc-period-detail">
            {period1.length}d · {period1.breakDays}d de descanso
            {period1.backwardExtension > 0 && ` (+${period1.backwardExtension} antes)`}
            {period1.forwardExtension > 0 && ` (+${period1.forwardExtension} depois)`}
          </span>
        </div>
        {!isSingle && (
          <div className="rc-period">
            <span className="rc-period-label">2º período</span>
            <span className="rc-period-date">{formatDate(period2.startDate)}</span>
            <span className="rc-period-detail">
              {period2.length}d · {period2.breakDays}d de descanso
              {period2.backwardExtension > 0 && ` (+${period2.backwardExtension} antes)`}
              {period2.forwardExtension > 0 && ` (+${period2.forwardExtension} depois)`}
            </span>
          </div>
        )}
      </div>

      <div className="rc-minibar">
        {miniMonthBar(period1.startDate, period1.length).map((m) => (
          <div key={m.month} className="rc-minibar-month">
            <span className="rc-minibar-label">{m.month}</span>
            <span className="rc-minibar-cells">{m.cells.join('')}</span>
          </div>
        ))}
        {!isSingle && miniMonthBar(period2.startDate, period2.length).map((m) => (
          <div key={m.month} className="rc-minibar-month">
            <span className="rc-minibar-label">{m.month}</span>
            <span className="rc-minibar-cells">{m.cells.join('')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
