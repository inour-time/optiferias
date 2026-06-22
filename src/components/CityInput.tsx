import { useState, useRef, useEffect, useCallback } from 'react'
import { fetchCitiesByState } from '../data/cidades'
import './CityInput.css'

interface CityInputProps {
  state: string
  value: string
  onChange: (value: string) => void
}

export default function CityInput({ state, value, onChange }: CityInputProps) {
  const [open, setOpen] = useState(false)
  const [cities, setCities] = useState<string[]>([])
  const [filtered, setFiltered] = useState<string[]>([])
  const [highlight, setHighlight] = useState(-1)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!state) { setCities([]); return }
    let cancelled = false
    fetchCitiesByState(state).then((list) => {
      if (!cancelled) setCities(list)
    })
    return () => { cancelled = true }
  }, [state])

  useEffect(() => {
    if (!value || !cities.length) { setFiltered([]); return }
    const q = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    const matches = cities.filter((c) =>
      c.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(q)
    ).slice(0, 15)
    setFiltered(matches)
  }, [value, cities])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const select = useCallback((name: string) => {
    onChange(name)
    setOpen(false)
    setHighlight(-1)
  }, [onChange])

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (!open || !filtered.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((p) => Math.min(p + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((p) => Math.max(p - 1, 0))
    } else if (e.key === 'Enter' && highlight >= 0) {
      e.preventDefault()
      select(filtered[highlight])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }, [open, filtered, highlight, select])

  return (
    <div className="ci-wrapper" ref={ref}>
      <input
        ref={inputRef}
        type="text"
        className="form-input ci-input"
        placeholder={state ? 'Digite o nome da cidade' : 'Selecione um estado primeiro'}
        value={value}
        disabled={!state}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
          setHighlight(-1)
        }}
        onFocus={() => { if (filtered.length) setOpen(true) }}
        onKeyDown={handleKey}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <ul className="ci-dropdown">
          {filtered.map((name, i) => (
            <li
              key={name}
              className={`ci-option ${i === highlight ? 'highlight' : ''}`}
              onMouseDown={() => select(name)}
              onMouseEnter={() => setHighlight(i)}
            >
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
