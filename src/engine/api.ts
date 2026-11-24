import { Holiday } from './types'
import { MUNICIPAL_HOLIDAYS } from '../data/municipios'

const FIXED_NATIONAL_HOLIDAYS: Record<string, string> = {
  '01-01': 'Confraternização Universal',
  '04-21': 'Tiradentes',
  '05-01': 'Dia do Trabalho',
  '09-07': 'Independência do Brasil',
  '10-12': 'Nossa Sra. Aparecida',
  '11-02': 'Finados',
  '11-15': 'Proclamação da República',
  '11-20': 'Dia da Consciência Negra',
  '12-25': 'Natal',
}

// Feriados móveis, em dias relativos ao domingo de Páscoa
const EASTER_BASED_HOLIDAYS: Array<[number, string]> = [
  [-48, 'Carnaval (segunda)'],
  [-47, 'Carnaval (terça)'],
  [-46, 'Quarta-feira de Cinzas'],
  [-2, 'Sexta-feira Santa'],
  [0, 'Páscoa'],
  [60, 'Corpus Christi'],
]

// Algoritmo de Meeus/Jones/Butcher (calendário gregoriano)
function easterSunday(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(Date.UTC(year, month - 1, day))
}

export function getNationalHolidays(year: number): Holiday[] {
  const holidays: Holiday[] = []
  const easter = easterSunday(year)

  for (const [offset, name] of EASTER_BASED_HOLIDAYS) {
    const d = new Date(easter.getTime() + offset * 86400000)
    holidays.push({
      date: `${year}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`,
      name,
      type: 'national',
    })
  }

  for (const [mmdd, name] of Object.entries(FIXED_NATIONAL_HOLIDAYS)) {
    holidays.push({ date: `${year}-${mmdd}`, name, type: 'national' })
  }

  return holidays.sort((x, y) => x.date.localeCompare(y.date))
}

const STATE_HOLIDAYS: Record<string, Record<string, string>> = {
  MG: {
    '04-21': 'Data Magna de MG',
  },
  RJ: {
    '04-23': 'Dia de São Jorge',
  },
  SP: {
    '07-09': 'Revolução Constitucionalista',
  },
  BA: {
    '07-02': 'Independência da Bahia',
  },
  PE: {
    '03-06': 'Revolução Pernambucana',
    '07-16': 'Dia da Nossa Sra. do Carmo',
  },
  CE: {
    '03-25': 'Data Magna do Ceará',
  },
  AC: {
    '01-23': 'Dia do Evangélico',
  },
  AM: {
    '09-05': 'Elevação do Amazonas',
  },
  AP: {
    '09-13': 'Criação do Território Federal',
  },
  DF: {
    '04-21': 'Fundação de Brasília',
  },
  ES: {
    '10-28': 'Dia do Servidor Público',
  },
  GO: {
    '07-26': 'Fundação da Cidade de Goiás',
  },
  MA: {
    '07-28': 'Adesão do Maranhão',
  },
  MT: {
    '01-20': 'Dia de São Sebastião',
  },
  MS: {
    '10-11': 'Criação do Estado',
  },
  PA: {
    '08-15': 'Adesão do Pará',
  },
  PB: {
    '08-05': 'Fundação da Paraíba',
  },
  PR: {
    '12-19': 'Emancipação do Paraná',
  },
  PI: {
    '10-19': 'Dia do Piauí',
  },
  RN: {
    '10-03': 'Mártires de Cunhaú',
  },
  RO: {
    '01-04': 'Criação do Estado',
  },
  RR: {
    '10-05': 'Criação do Estado',
  },
  RS: {
    '09-20': 'Revolução Farroupilha',
  },
  SC: {
    '08-11': 'Criação da Província',
  },
  SE: {
    '07-08': 'Emancipação Política',
  },
  TO: {
    '10-05': 'Criação do Estado',
  },
}

function pad(n: number): string {
  return n < 10 ? '0' + n : String(n)
}

export async function fetchHolidays(
  year: number,
  state: string,
  city: string
): Promise<Holiday[]> {
  const holidays: Holiday[] = getNationalHolidays(year)

  if (state && STATE_HOLIDAYS[state]) {
    for (const [mmdd, name] of Object.entries(STATE_HOLIDAYS[state])) {
      const dateStr = `${year}-${mmdd}`
      if (!holidays.find((h) => h.date === dateStr)) {
        holidays.push({ date: dateStr, name, type: 'state' })
      }
    }
  }

  // A feriadosapi.com não libera CORS e a chave não pode ir para o bundle,
  // então a consulta passa pela função serverless /api/feriados (Vercel).
  try {
    const params = new URLSearchParams({ ano: String(year) })
    if (state) params.set('uf', state)

    const res = await fetch(`/api/feriados?${params}`, {
      signal: AbortSignal.timeout(8000),
    })

    const isJson = res.headers.get('content-type')?.includes('application/json')
    if (res.ok && isJson) {
      const data = await res.json()
      const apiHolidays = data.feriados ?? data ?? []

      for (const h of Array.isArray(apiHolidays) ? apiHolidays : []) {
        const dateParts = h.data?.split('/')
        let dateStr: string
        if (dateParts?.length === 3) {
          dateStr = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
        } else if (h.data?.match(/^\d{4}-\d{2}-\d{2}$/)) {
          dateStr = h.data
        } else {
          continue
        }

        const existing = holidays.find((x) => x.date === dateStr)
        if (existing) {
          existing.name = h.nome ?? h.name ?? existing.name
        } else {
          holidays.push({
            date: dateStr,
            name: h.nome ?? h.name ?? 'Feriado',
            type: (h.tipo ?? '').toLowerCase().includes('estadual')
              ? 'state'
              : 'national',
          })
        }
      }
    }
  } catch {
    // API indisponível (ex.: dev local sem a função serverless), usar fallback local
  }

  if (city) {
    const cityKey = `${state}-${city}`.toLowerCase()
    for (const [key, cityHolidays] of Object.entries(MUNICIPAL_HOLIDAYS)) {
      const normalizedKey = key.toLowerCase()
      if (cityKey === normalizedKey || city.toLowerCase() === normalizedKey) {
        for (const h of cityHolidays) {
          if (h.year === year || !h.year) {
            const dateStr = h.year
              ? `${h.year}-${h.date}`
              : `${year}-${h.date}`
            if (!holidays.find((x) => x.date === dateStr)) {
              holidays.push({ date: dateStr, name: h.name, type: 'municipal' })
            }
          }
        }
      }
    }
  }

  return holidays
}
