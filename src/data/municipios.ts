interface MunicipalHolidayEntry {
  date: string
  name: string
  year?: number
}

export const MUNICIPAL_HOLIDAYS: Record<string, MunicipalHolidayEntry[]> = {
  'mg-cataguases': [
    { date: '05-22', name: 'Santa Rita de Cássia (Padroeira)' },
    { date: '09-07', name: 'Aniversário de Cataguases' },
  ],
}
