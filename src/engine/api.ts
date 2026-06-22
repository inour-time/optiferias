import { Holiday } from './types'
import { MUNICIPAL_HOLIDAYS } from '../data/municipios'

const NATIONAL_HOLIDAYS_2025: Record<string, string> = {
  '01-01': 'Ano Novo',
  '04-18': 'Sexta-feira Santa',
  '04-20': 'Páscoa',
  '04-21': 'Tiradentes',
  '05-01': 'Dia do Trabalho',
  '09-07': 'Independência do Brasil',
  '10-12': 'Nossa Sra. Aparecida',
  '11-02': 'Finados',
  '11-15': 'Proclamação da República',
  '11-20': 'Dia da Consciência Negra',
  '12-25': 'Natal',
}

const NATIONAL_HOLIDAYS_2026: Record<string, string> = {
  '01-01': 'Confraternização Universal',
  '02-16': 'Carnaval (segunda)',
  '02-17': 'Carnaval (terça)',
  '02-18': 'Quarta-feira de Cinzas',
  '04-03': 'Sexta-feira Santa',
  '04-05': 'Páscoa',
  '04-21': 'Tiradentes',
  '05-01': 'Dia do Trabalho',
  '06-04': 'Corpus Christi',
  '09-07': 'Independência do Brasil',
  '10-12': 'Nossa Sra. Aparecida',
  '11-02': 'Finados',
  '11-15': 'Proclamação da República',
  '11-20': 'Dia da Consciência Negra',
  '12-25': 'Natal',
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
  const holidays: Holiday[] = []

  const nationalMap = year === 2025 ? NATIONAL_HOLIDAYS_2025 : NATIONAL_HOLIDAYS_2026
  for (const [mmdd, name] of Object.entries(nationalMap)) {
    holidays.push({
      date: `${year}-${mmdd}`,
      name,
      type: 'national',
    })
  }

  if (state && STATE_HOLIDAYS[state]) {
    for (const [mmdd, name] of Object.entries(STATE_HOLIDAYS[state])) {
      const dateStr = `${year}-${mmdd}`
      if (!holidays.find((h) => h.date === dateStr)) {
        holidays.push({ date: dateStr, name, type: 'state' })
      }
    }
  }

  const apiKey = import.meta.env.VITE_FERIADOS_API_KEY as string | undefined
  if (apiKey && apiKey.length > 0) {
    try {
      const url = state
        ? `https://feriadosapi.com/api/v1/feriados/estado/${state}?ano=${year}`
        : `https://feriadosapi.com/api/v1/feriados/nacionais?ano=${year}`

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${apiKey}` },
      })

      if (res.ok) {
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
      // API indisponível, usar fallback local
    }
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
