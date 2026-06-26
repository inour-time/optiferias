import { useMemo } from 'react'
import { Scenario } from '../engine/types'
import './CalendarView.css'

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function fmt(d: Date): string {
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  const dias = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']
  return `${d.getDate()} ${meses[d.getMonth()]} (${dias[d.getDay()]})`
}

interface CalendarViewProps {
  scenarios: Scenario[]
  selectedRank: number
  onSelectRank: (rank: number) => void
}

export default function CalendarView({ scenarios, selectedRank, onSelectRank }: CalendarViewProps) {
  const scenario = scenarios.find((s) => s.rank === selectedRank) ?? scenarios[0]

  const markedDates = useMemo(() => {
    const set = new Set<string>()
    function mark(start: Date, len: number) {
      for (let i = 0; i < len; i++) {
        const d = new Date(start)
        d.setDate(d.getDate() + i)
        set.add(dateKey(d))
      }
    }
    mark(scenario.period1.startDate, scenario.period1.length)
    if (scenario.period2.length > 0) {
      mark(scenario.period2.startDate, scenario.period2.length)
    }
    return set
  }, [scenario])

  const year = scenario.period1.startDate.getFullYear()

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, mi) => {
      const firstDay = new Date(year, mi, 1).getDay()
      const daysInMonth = new Date(year, mi + 1, 0).getDate()
      const cells: { day: number; isMarked: boolean; isWeekend: boolean }[] = []
      for (let i = 0; i < firstDay; i++) cells.push({ day: 0, isMarked: false, isWeekend: false })
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, mi, d)
        const dow = date.getDay()
        cells.push({
          day: d,
          isMarked: markedDates.has(dateKey(date)),
          isWeekend: dow === 0 || dow === 6,
        })
      }
      return { index: mi, name: MONTHS[mi], cells }
    })
  }, [year, markedDates])

  const totalOff = scenario.totalBreakDays
  const totalSpent = scenario.vacationDaysSpent
  const daysSaved = totalOff - totalSpent
  const isSingle = scenario.period2.length === 0
  const hasSellKeep = scenario.sellDays > 0 || scenario.keepDays > 0

  function periodDesc(p: typeof scenario.period1): string {
    let parts: string[] = []
    if (p.backwardExtension > 0) parts.push(`${p.backwardExtension} dia(s) antes`)
    if (p.forwardExtension > 0) parts.push(`${p.forwardExtension} dia(s) depois`)
    const ext = parts.length > 0 ? ` (+ ${parts.join(', ')})` : ''
    return `${fmt(p.startDate)} por ${p.length} dias → ${p.breakDays} dias de descanso${ext}`
  }

  function fmtDate(dateStr: string): string {
    if (!dateStr) return ''
    const [y, m, d] = dateStr.split('-')
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
    return `${parseInt(d)} ${meses[parseInt(m) - 1]} de ${y}`
  }

  return (
    <div className="cv-container">
      <div className="cv-headline">
        <strong>Cenário #{scenario.rank}:</strong>{' '}
        Com {totalSpent} dias de saldo
        {isSingle ? '' : ` divididos em ${scenario.splitLabel}`},
        você aproveita <strong>{totalOff} dias consecutivos de descanso</strong>
        {daysSaved > 0 && (
          <span className="cv-headline-green"> — são {daysSaved} dias extras grátis!</span>
        )}
      </div>

      {hasSellKeep && (
        <div className="cv-sellkeep-bar">
          <span className="cv-sellkeep-item">
            <strong>{scenario.vacationDaysSpent}</strong> dias tirados
          </span>
          <span className="cv-sellkeep-sep">|</span>
          <span className="cv-sellkeep-item">
            <strong>{scenario.sellDays}</strong> dias vendidos
          </span>
          {scenario.keepDays > 0 && (
            <>
              <span className="cv-sellkeep-sep">|</span>
              <span className="cv-sellkeep-item cv-sellkeep-keep">
                <strong>{scenario.keepDays}</strong> dias guardados
                {scenario.keepDeadline ? (
                  <span className="cv-sellkeep-deadline">
                    (válido até {fmtDate(scenario.keepDeadline)})
                  </span>
                ) : (
                  <span className="cv-sellkeep-deadline cv-sellkeep-deadline-warn">
                    (devem ser marcados antes do próximo período)
                  </span>
                )}
              </span>
            </>
          )}
        </div>
      )}

      <div className="cv-summary">
        <div className="cv-summary-item">
          <span className="cv-summary-value">{totalOff}</span>
          <span className="cv-summary-label">Dias de descanso</span>
          <span className="cv-summary-hint">total que você fica off</span>
        </div>
        <div className="cv-summary-item">
          <span className="cv-summary-value">{totalSpent}</span>
          <span className="cv-summary-label">Dias do seu saldo</span>
          <span className="cv-summary-hint">que você vai gastar</span>
        </div>
        <div className="cv-summary-item cv-summary-green">
          <span className="cv-summary-value">+{daysSaved}</span>
          <span className="cv-summary-label">Dias extras grátis</span>
          <span className="cv-summary-hint">feriados + fins de semana</span>
        </div>
        <div className="cv-summary-item">
          <span className="cv-summary-value">{scenario.totalEfficiency.toFixed(2)}x</span>
          <span className="cv-summary-label">Aproveitamento</span>
          <span className="cv-summary-hint">cada dia vale por {scenario.totalEfficiency.toFixed(2)}</span>
        </div>
      </div>

      <div className="cv-periods-box">
        <div className="cv-period">
          <span className="cv-period-badge">1º período</span>
          <span className="cv-period-desc">{periodDesc(scenario.period1)}</span>
        </div>
        {!isSingle && (
          <div className="cv-period">
            <span className="cv-period-badge">2º período</span>
            <span className="cv-period-desc">{periodDesc(scenario.period2)}</span>
          </div>
        )}
      </div>

      <div className="cv-selector">
        <label className="cv-selector-label">Ver outro cenário:</label>
        <select
          className="cv-select"
          value={selectedRank}
          onChange={(e) => onSelectRank(Number(e.target.value))}
        >
          {scenarios.map((s) => (
            <option key={s.rank} value={s.rank}>
              #{s.rank} — {s.totalBreakDays} dias de descanso · {s.splitLabel} · {s.totalEfficiency.toFixed(2)}x
            </option>
          ))}
        </select>
      </div>

      <div className="cv-calendar">
        {months.map((m) => (
          <div key={m.index} className="cv-month">
            <div className="cv-month-title">{m.name}</div>
            <div className="cv-days-header">
              {DAY_NAMES.map((dn) => (
                <span key={dn} className="cv-dh">{dn}</span>
              ))}
            </div>
            <div className="cv-days-grid">
              {m.cells.map((cell, i) => (
                <span
                  key={i}
                  className={`cv-day ${cell.isMarked ? 'marked' : ''} ${cell.isWeekend && !cell.isMarked ? 'weekend' : ''} ${cell.day === 0 ? 'empty' : ''}`}
                >
                  {cell.day > 0 ? cell.day : ''}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="cv-legend">
        <span className="cv-legend-item">
          <span className="cv-legend-dot marked" /> Férias
        </span>
        <span className="cv-legend-item">
          <span className="cv-legend-dot weekend" /> Fim de semana
        </span>
        <span className="cv-legend-item">
          <span className="cv-legend-dot" /> Dia útil
        </span>
      </div>
    </div>
  )
}
