import { useState, useCallback, useEffect } from 'react'
import Form from './components/Form'
import ResultList from './components/ResultList'
import CalendarView from './components/CalendarView'
import ErrorMessage from './components/ErrorMessage'
import { optimize } from './engine/optimizer'
import { SplitPattern, Scenario, SellKeepConfig } from './engine/types'
import { loadKeptRecords, saveKeptRecord, updateKeptRecord, deleteKeptRecord, generateId, KeptDaysRecord } from './services/storage'
import './App.css'

export default function App() {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRank, setSelectedRank] = useState(1)
  const [compensatoryDays, setCompensatoryDays] = useState<string[]>([])
  const [keptRecords, setKeptRecords] = useState<KeptDaysRecord[]>([])
  const [showKeptPanel, setShowKeptPanel] = useState(false)

  useEffect(() => {
    setKeptRecords(loadKeptRecords())
  }, [])

  const handleCalculate = useCallback(
    async (balance: number, year: number, state: string, city: string, fromDate: string, splits: SplitPattern[], compensatoryDays: string[], sellKeep?: SellKeepConfig) => {
      setLoading(true)
      setError(null)
      setScenarios([])
      setSelectedRank(1)

      try {
        const result = await optimize(balance, splits, year, state, city, 10, fromDate, undefined, compensatoryDays, sellKeep)
        if (result.length === 0) {
          setError('Nenhum cenário encontrado. Tente outros parâmetros.')
        } else {
          setScenarios(result)
          if (sellKeep && sellKeep.keepDays > 0) {
            const record: KeptDaysRecord = {
              id: generateId(),
              keptDays: sellKeep.keepDays,
              totalBalance: balance,
              sellDays: sellKeep.sellDays,
              takenDays: balance - sellKeep.sellDays - sellKeep.keepDays,
              year,
              deadline: sellKeep.keepDeadline,
              nextAquisitiveStart: sellKeep.nextAquisitiveStart,
              createdAt: new Date().toISOString(),
              usedDays: 0,
              status: 'pending',
            }
            saveKeptRecord(record)
            setKeptRecords(loadKeptRecords())
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao calcular. Tente novamente.')
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const handleMarkUsed = useCallback((id: string) => {
    const record = keptRecords.find((r) => r.id === id)
    if (!record) return
    const newUsed = record.usedDays + 1
    const newStatus = newUsed >= record.keptDays ? 'completed' : 'partial'
    updateKeptRecord(id, { usedDays: newUsed, status: newStatus })
    setKeptRecords(loadKeptRecords())
  }, [keptRecords])

  const handleDeleteRecord = useCallback((id: string) => {
    deleteKeptRecord(id)
    setKeptRecords(loadKeptRecords())
  }, [])

  function fmtDate(dateStr: string): string {
    if (!dateStr) return ''
    const [y, m, d] = dateStr.split('-')
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
    return `${parseInt(d)} ${meses[parseInt(m) - 1]} de ${y}`
  }

  return (
    <div className="app">
      <aside className="app-sidebar">
        <div className="app-logo">
          <span className="app-logo-icon">&#9670;</span>
          <span className="app-logo-text">OptiFérias</span>
        </div>
        <Form onCalculate={handleCalculate} loading={loading} compensatoryDays={compensatoryDays} onCompensatoryDaysChange={setCompensatoryDays} />

        {keptRecords.filter((r) => r.status !== 'completed').length > 0 && (
          <div className="app-kept-toggle" onClick={() => setShowKeptPanel(!showKeptPanel)}>
            <span className="app-kept-toggle-icon">{showKeptPanel ? '▾' : '▸'}</span>
            <span>{keptRecords.filter((r) => r.status !== 'completed').length} registro(s) de dias guardados</span>
          </div>
        )}

        {showKeptPanel && keptRecords.length > 0 && (
          <div className="app-kept-panel">
            {keptRecords.filter((r) => r.status !== 'completed').map((rec) => (
              <div key={rec.id} className={`app-kept-card ${rec.status === 'partial' ? 'partial' : ''}`}>
                <div className="app-kept-card-top">
                  <strong>{rec.keptDays} dias guardados</strong>
                  <span className="app-kept-status">{rec.status === 'partial' ? `(usando ${rec.usedDays}/${rec.keptDays})` : '(pendente)'}</span>
                </div>
                <div className="app-kept-card-detail">
                  Saldo: {rec.totalBalance}d · Vendidos: {rec.sellDays}d · Tirados: {rec.takenDays}d · Ano: {rec.year}
                </div>
                {rec.deadline && (
                  <div className="app-kept-card-deadline">
                    Válido até: {fmtDate(rec.deadline)}
                  </div>
                )}
                {!rec.deadline && (
                  <div className="app-kept-card-deadline app-kept-card-warn">
                    Devem ser marcados antes do próximo período aquisitivo
                  </div>
                )}
                <div className="app-kept-card-actions">
                  <button className="app-kept-btn" onClick={() => handleMarkUsed(rec.id)}>
                    Marcar 1 dia como utilizado
                  </button>
                  <button className="app-kept-btn app-kept-btn-danger" onClick={() => handleDeleteRecord(rec.id)}>
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </aside>

      <main className="app-main">
        <header className="app-header">
          <h1 className="app-title">Melhores datas para suas férias</h1>
          <p className="app-subtitle">
            {scenarios.length > 0
              ? `${scenarios.length} cenários encontrados`
              : 'Configure ao lado e descubra como maximizar seu descanso'}
          </p>
        </header>

        <ErrorMessage message={error} />

        {loading && (
          <div className="app-loading">
            <div className="app-loading-spinner" />
            <span>Calculando melhores cenários...</span>
          </div>
        )}

        {scenarios.length > 0 && (
          <>
            <div className="app-tabs">
              <button
                className={`app-tab ${selectedRank === 0 ? 'active' : ''}`}
                onClick={() => setSelectedRank(0)}
              >
                Todos os cenários
              </button>
              <button
                className={`app-tab ${selectedRank > 0 ? 'active' : ''}`}
                onClick={() => setSelectedRank(scenarios[0]?.rank ?? 1)}
              >
                Calendário
              </button>
            </div>

            {selectedRank === 0 && <ResultList scenarios={scenarios} onSelect={setSelectedRank} />}
            {selectedRank > 0 && (
              <CalendarView
                scenarios={scenarios}
                selectedRank={selectedRank}
                onSelectRank={setSelectedRank}
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}
