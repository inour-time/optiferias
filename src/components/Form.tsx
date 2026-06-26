import { useState, useCallback, useEffect, useRef } from 'react'
import { generateSplits, parseCustomSplit } from '../engine/splits'
import { SplitPattern, BRAZILIAN_STATES } from '../engine/types'
import CityInput from './CityInput'
import './Form.css'

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface FormProps {
  onCalculate: (balance: number, year: number, state: string, city: string, fromDate: string, splits: SplitPattern[], compensatoryDays: string[]) => void
  loading: boolean
  compensatoryDays: string[]
  onCompensatoryDaysChange: (days: string[]) => void
}

export default function Form({ onCalculate, loading, compensatoryDays, onCompensatoryDaysChange }: FormProps) {
  const [balance, setBalance] = useState(30)
  const [year, setYear] = useState(2026)
  const [state, setState] = useState('MG')
  const [city, setCity] = useState('')
  const [fromDate, setFromDate] = useState(todayStr())
  const [selectedLabels, setSelectedLabels] = useState<Set<string>>(new Set())
  const [customInput, setCustomInput] = useState('')
  const [customError, setCustomError] = useState<string | null>(null)
  const [customSplit, setCustomSplit] = useState<SplitPattern | null>(null)
  const [compensatoryDateInput, setCompensatoryDateInput] = useState('')
  const userChangedSplits = useRef(false)

  const currentSplits = generateSplits(balance)

  useEffect(() => {
    if (currentSplits.length > 0 && selectedLabels.size === 0 && !userChangedSplits.current) {
      setSelectedLabels(new Set([currentSplits[0].label]))
    }
  }, [currentSplits])

  const handleBalanceChange = useCallback((val: number) => {
    userChangedSplits.current = false
    setBalance(val)
    setSelectedLabels(new Set())
    setCustomInput('')
    setCustomSplit(null)
    setCustomError(null)
  }, [])

  const toggleSplit = useCallback((label: string) => {
    userChangedSplits.current = true
    setSelectedLabels((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }, [])

  const handleCustomChange = useCallback((val: string) => {
    setCustomInput(val)
    if (!val.trim()) {
      setCustomSplit(null)
      setCustomError(null)
      return
    }
    const result = parseCustomSplit(balance, val)
    if (result.error) {
      setCustomSplit(null)
      setCustomError(result.error)
    } else {
      setCustomSplit(result.split)
      setCustomError(null)
    }
  }, [balance])

  const removeCustom = useCallback(() => {
    setCustomInput('')
    setCustomSplit(null)
    setCustomError(null)
  }, [])

  const addCompensatoryDay = useCallback(() => {
    if (!compensatoryDateInput) return
    if (compensatoryDays.includes(compensatoryDateInput)) return
    onCompensatoryDaysChange([...compensatoryDays, compensatoryDateInput])
    setCompensatoryDateInput('')
  }, [compensatoryDateInput, compensatoryDays, onCompensatoryDaysChange])

  const removeCompensatoryDay = useCallback((day: string) => {
    onCompensatoryDaysChange(compensatoryDays.filter((d) => d !== day))
  }, [compensatoryDays, onCompensatoryDaysChange])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const splits: SplitPattern[] = []

      for (const s of currentSplits) {
        if (selectedLabels.has(s.label)) splits.push(s)
      }
      if (customSplit) splits.push(customSplit)

      if (splits.length === 0) return
      onCalculate(balance, year, state, city.trim(), fromDate, splits, compensatoryDays)
    },
    [balance, year, state, city, fromDate, currentSplits, selectedLabels, customSplit, onCalculate, compensatoryDays]
  )

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-card">
        <h2 className="form-card-title">Planejar Novo Período</h2>

        <div className="form-group">
          <label className="form-label">Saldo de dias</label>
          <input
            type="number"
            className="form-input"
            min={1}
            max={60}
            value={balance}
            onChange={(e) => handleBalanceChange(Number(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Ano</label>
          <select className="form-input" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">A partir de</label>
          <input
            type="date"
            className="form-input"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Estado</label>
          <select className="form-input" value={state} onChange={(e) => { setState(e.target.value); setCity('') }}>
            {BRAZILIAN_STATES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Cidade <span className="form-label-opt">(opcional)</span></label>
          <CityInput state={state} value={city} onChange={setCity} />
        </div>

        {currentSplits.length > 1 && (
          <div className="form-group">
            <label className="form-label">Divisão das férias</label>
            <div className="form-splits">
              {currentSplits.map((s) => (
                <label key={s.label} className={`form-chip ${selectedLabels.has(s.label) ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={selectedLabels.has(s.label)}
                    onChange={() => toggleSplit(s.label)}
                  />
                  <span>{s.label}</span>
                </label>
              ))}
              {customSplit && (
                <span className="form-chip selected">
                  <span>{customSplit.label}</span>
                  <button type="button" className="form-chip-remove" onClick={removeCustom}>&times;</button>
                </span>
              )}
            </div>
            <div className="form-custom-split">
              <input
                type="text"
                className={`form-input form-custom-input ${customError ? 'input-error' : ''}`}
                placeholder={currentSplits.length > 1 ? 'Ou digite sua própria divisão (ex: 14+16)' : ''}
                value={customInput}
                onChange={(e) => handleCustomChange(e.target.value)}
              />
              {customError && <span className="form-custom-error">{customError}</span>}
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Dias compensados <span className="form-label-opt">(opcional)</span></label>
          <div className="form-compensatory-row">
            <input
              type="date"
              className="form-input form-compensatory-input"
              value={compensatoryDateInput}
              onChange={(e) => setCompensatoryDateInput(e.target.value)}
            />
            <button type="button" className="form-compensatory-btn" onClick={addCompensatoryDay} disabled={!compensatoryDateInput}>
              Adicionar
            </button>
          </div>
          {compensatoryDays.length > 0 && (
            <div className="form-splits">
              {compensatoryDays.map((day) => (
                <span key={day} className="form-chip selected">
                  <span>{day}</span>
                  <button type="button" className="form-chip-remove" onClick={() => removeCompensatoryDay(day)}>&times;</button>
                </span>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="form-btn" disabled={loading || (selectedLabels.size === 0 && !customSplit)}>
          {loading ? 'Calculando...' : 'Calcular Melhores Datas'}
        </button>
      </div>
    </form>
  )
}
