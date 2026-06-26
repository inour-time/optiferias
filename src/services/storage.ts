export interface KeptDaysRecord {
  id: string
  keptDays: number
  totalBalance: number
  sellDays: number
  takenDays: number
  year: number
  deadline?: string
  nextAquisitiveStart?: string
  createdAt: string
  usedDays: number
  status: 'pending' | 'partial' | 'completed'
}

const STORAGE_KEY = 'optiferias_kept_records'

export function loadKeptRecords(): KeptDaysRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveKeptRecord(record: KeptDaysRecord): void {
  const records = loadKeptRecords()
  records.push(record)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function updateKeptRecord(id: string, changes: Partial<KeptDaysRecord>): void {
  const records = loadKeptRecords()
  const index = records.findIndex((r) => r.id === id)
  if (index === -1) return
  records[index] = { ...records[index], ...changes }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function deleteKeptRecord(id: string): void {
  const records = loadKeptRecords()
  const filtered = records.filter((r) => r.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}