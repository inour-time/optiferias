import { useState, useCallback } from 'react'
import Form from './components/Form'
import ResultList from './components/ResultList'
import CalendarView from './components/CalendarView'
import ErrorMessage from './components/ErrorMessage'
import { optimize } from './engine/optimizer'
import { SplitPattern, Scenario } from './engine/types'
import './App.css'

export default function App() {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRank, setSelectedRank] = useState(1)

  const handleCalculate = useCallback(
    async (balance: number, year: number, state: string, city: string, fromDate: string, splits: SplitPattern[]) => {
      setLoading(true)
      setError(null)
      setScenarios([])
      setSelectedRank(1)

      try {
        const result = await optimize(balance, splits, year, state, city, 10, fromDate)
        if (result.length === 0) {
          setError('Nenhum cenário encontrado. Tente outros parâmetros.')
        } else {
          setScenarios(result)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao calcular. Tente novamente.')
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return (
    <div className="app">
      <aside className="app-sidebar">
        <div className="app-logo">
          <span className="app-logo-icon">&#9670;</span>
          <span className="app-logo-text">OptiFérias</span>
        </div>
        <Form onCalculate={handleCalculate} loading={loading} />
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
