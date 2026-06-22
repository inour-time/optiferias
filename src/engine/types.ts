export interface Holiday {
  date: string
  name: string
  type: 'national' | 'state' | 'municipal'
}

export interface DayInfo {
  date: Date
  isSunday: boolean
  isHoliday: boolean
  holidayName: string | null
  dayOfYear: number
}

export interface SplitPattern {
  periodA: number
  periodB: number
  label: string
}

export interface PeriodResult {
  startDate: Date
  length: number
  breakDays: number
  efficiency: number
  backwardExtension: number
  forwardExtension: number
}

export interface Scenario {
  period1: PeriodResult
  period2: PeriodResult
  splitLabel: string
  totalBreakDays: number
  vacationDaysSpent: number
  totalEfficiency: number
  rank: number
}

export interface AppState {
  balance: number
  year: number
  state: string
  city: string
  selectedSplits: SplitPattern[]
  scenarios: Scenario[]
  loading: boolean
  error: string | null
}

export const BRAZILIAN_STATES = [
  { value: '', label: 'Nenhum' },
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
]
