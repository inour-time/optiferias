import { useState, useCallback } from 'react'
import './HomeOfficeChecker.css'

const MS_PER_DAY = 1000 * 60 * 60 * 24

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? 1 : -(day - 1)
  const monday = new Date(d)
  monday.setDate(monday.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function getWeekType(
  refMonday: Date,
  refType: 'presencial' | 'home',
  targetDate: Date
): 'presencial' | 'home' {
  const targetMonday = getMonday(targetDate)
  const diffDays = (targetMonday.getTime() - refMonday.getTime()) / MS_PER_DAY
  const diffWeeks = Math.round(diffDays / 7)
  const isEven = diffWeeks % 2 === 0
  if (isEven) return refType
  return refType === 'presencial' ? 'home' : 'presencial'
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('pt-BR')
}

interface WeekResult {
  start: Date
  end: Date
  type: 'presencial' | 'home'
}

interface HomeOfficeCheckerProps {
  periodStart?: Date
  periodEnd?: Date
}

export default function HomeOfficeChecker({ periodStart, periodEnd }: HomeOfficeCheckerProps) {
  const [refType, setRefType] = useState<'presencial' | 'home' | ''>('')
  const [customDate, setCustomDate] = useState('')
  const [result, setResult] = useState<{ date: Date; type: 'presencial' | 'home' } | null>(null)
  const [weeks, setWeeks] = useState<WeekResult[]>([])
  const [expanded, setExpanded] = useState(false)

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const refMonday = getMonday(today)

  const checkDate = useCallback((date: Date) => {
    if (!refType) return
    const type = getWeekType(refMonday, refType as 'presencial' | 'home', date)
    setResult({ date, type })
  }, [refType, refMonday])

  const handleCheckCustom = useCallback(() => {
    if (!customDate || !refType) return
    checkDate(new Date(customDate + 'T00:00:00'))
  }, [customDate, refType, checkDate])

  const handleToggleExpand = useCallback(() => {
    if (!expanded && periodStart && periodEnd && refType) {
      const mondayStart = getMonday(periodStart)
      const mondayEnd = getMonday(periodEnd)

      const weeksList: WeekResult[] = []
      const current = new Date(mondayStart)
      while (current <= mondayEnd) {
        const weekStart = new Date(current)
        const weekEnd = new Date(current)
        weekEnd.setDate(weekEnd.getDate() + 6)
        weeksList.push({
          start: new Date(weekStart),
          end: weekEnd,
          type: getWeekType(refMonday, refType as 'presencial' | 'home', weekStart),
        })
        current.setDate(current.getDate() + 7)
      }
      setWeeks(weeksList)
    }
    setExpanded(!expanded)
  }, [expanded, periodStart, periodEnd, refType, refMonday])

  return (
    <div className="hoc-container">
      <div className="hoc-header" onClick={() => setExpanded(!expanded)}>
        <span className="hoc-icon">{expanded ? '▾' : '▸'}</span>
        <span className="hoc-title">Calculadora Home Office</span>
        <span className="hoc-subtitle">
          {refType
            ? `Semana atual: ${refType === 'presencial' ? 'Presencial' : 'Home Office'}`
            : 'Configure seu regime'}
        </span>
      </div>

      {expanded && (
        <div className="hoc-body">
          <p className="hoc-description">
            Com base no regime da sua semana atual, esta calculadora determina
            automaticamente se uma data futura será presencial ou home office,
            seguindo o padrão de alternância quinzenal. Útil para planejar
            seus dias de trabalho e períodos de descanso.
          </p>

          <div className="hoc-field">
            <label className="hoc-label">Regime da sua semana atual:</label>
            <select
              className="hoc-select"
              value={refType}
              onChange={(e) => setRefType(e.target.value as 'presencial' | 'home')}
            >
              <option value="">-- Selecione --</option>
              <option value="presencial">Presencial</option>
              <option value="home">Home Office</option>
            </select>
          </div>

          <div className="hoc-field">
            <label className="hoc-label">Qual data você quer verificar?</label>
            <div className="hoc-row">
              <input
                type="date"
                className="hoc-date-input"
                value={customDate}
                min={todayStr}
                onChange={(e) => setCustomDate(e.target.value)}
              />
              <button
                className="hoc-btn"
                disabled={!refType || !customDate}
                onClick={handleCheckCustom}
              >
                Verificar Semana
              </button>
            </div>
          </div>

          {result && (
            <div
              className={`hoc-result ${
                result.type === 'presencial' ? 'hoc-result-presencial' : 'hoc-result-home'
              }`}
            >
              A semana de <strong>{fmtDate(result.date)}</strong> é:{' '}
              <strong>{result.type === 'presencial' ? 'Presencial' : 'Home Office'}</strong>
            </div>
          )}

          {periodStart && periodEnd && refType && (
            <div className="hoc-period-weeks">
              <button className="hoc-period-btn" onClick={handleToggleExpand}>
                {weeks.length > 0
                  ? 'Ocultar detalhamento do período'
                  : 'Ver detalhamento do período de férias'}
              </button>

              {weeks.length > 0 && (
                <div className="hoc-weeks-grid">
                  {weeks.map((w, i) => (
                    <div
                      key={i}
                      className={`hoc-week-card ${
                        w.type === 'presencial' ? 'hoc-week-presencial' : 'hoc-week-home'
                      }`}
                    >
                      <span className="hoc-week-label">
                        {fmtDate(w.start)} — {fmtDate(w.end)}
                      </span>
                      <span className="hoc-week-badge">
                        {w.type === 'presencial' ? 'Presencial' : 'Home Office'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <p className="hoc-developer">Desenvolvido por Hugo Garcia</p>
        </div>
      )}
    </div>
  )
}
