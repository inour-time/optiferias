import {
  SplitPattern,
  PeriodResult,
  Scenario,
  Holiday,
  SellKeepConfig,
} from './types'
import {
  buildYearCalendar,
  isStartDateValid,
  getConsecutiveNonWorkingBefore,
  getConsecutiveNonWorkingAfter,
} from './calendar'
import { fetchHolidays } from './api'

function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0)
  return Math.floor((d.getTime() - start.getTime()) / 86400000)
}

function optimizePeriod(
  days: ReturnType<typeof buildYearCalendar>,
  length: number,
  minDay: number
): PeriodResult[] {
  const results: PeriodResult[] = []

  for (let start = minDay; start <= days.length - length; start++) {
    if (!isStartDateValid(days, start)) continue

    const endDay = start + length - 1
    const backward = getConsecutiveNonWorkingBefore(days, start)
    const forward = getConsecutiveNonWorkingAfter(days, endDay)
    const breakDays = backward + length + forward
    const efficiency = breakDays / length

    results.push({
      startDate: days[start].date,
      length,
      breakDays,
      efficiency,
      backwardExtension: backward,
      forwardExtension: forward,
    })
  }

  results.sort((a, b) => b.efficiency - a.efficiency)
  return results.slice(0, 15)
}

export async function optimize(
  balance: number,
  selectedSplits: SplitPattern[],
  year: number,
  state: string,
  city: string,
  topN: number = 10,
  fromDate?: string,
  onStatus?: (msg: string) => void,
  compensatoryDays?: string[],
  sellKeep?: SellKeepConfig
): Promise<Scenario[]> {
  onStatus?.('Buscando feriados...')
  const holidays: Holiday[] = await fetchHolidays(year, state, city)

  onStatus?.('Montando calendário...')
  const days = buildYearCalendar(year, holidays, compensatoryDays)

  let minDay = 0
  if (fromDate) {
    const parsed = new Date(fromDate)
    if (!isNaN(parsed.getTime())) {
      minDay = dayOfYear(parsed)
    }
  }

  const scenarios: Scenario[] = []

  for (const split of selectedSplits) {
    onStatus?.(`Otimizando split ${split.label}...`)

    const resultsA = optimizePeriod(days, split.periodA, minDay)
    const resultsB = split.periodB > 0 ? optimizePeriod(days, split.periodB, minDay) : []

    const topA = resultsA.slice(0, 10)
    const topB = resultsB.slice(0, 10)

    const sellDays = sellKeep?.sellDays ?? 0
    const keepDays = sellKeep?.keepDays ?? 0
    const keepDeadline = sellKeep?.keepDeadline

    if (split.periodB === 0) {
      for (const ra of topA) {
        scenarios.push({
          period1: ra,
          period2: {
            startDate: new Date(0),
            length: 0,
            breakDays: 0,
            efficiency: 0,
            backwardExtension: 0,
            forwardExtension: 0,
          },
          splitLabel: split.label,
          totalBreakDays: ra.breakDays,
          vacationDaysSpent: ra.length,
          totalEfficiency: ra.efficiency,
          rank: 0,
          sellDays,
          keepDays,
          keepDeadline,
        })
      }
    } else {
      for (const ra of topA) {
        for (const rb of topB) {
          scenarios.push({
            period1: ra,
            period2: rb,
            splitLabel: split.label,
            totalBreakDays: ra.breakDays + rb.breakDays,
            vacationDaysSpent: ra.length + rb.length,
            totalEfficiency:
              (ra.breakDays + rb.breakDays) / (ra.length + rb.length),
            rank: 0,
            sellDays,
            keepDays,
            keepDeadline,
          })
        }
      }
    }
  }

  scenarios.sort((a, b) => {
    const effDiff = b.totalEfficiency - a.totalEfficiency
    if (Math.abs(effDiff) > 0.001) return effDiff
    return b.totalBreakDays - a.totalBreakDays
  })

  return scenarios.slice(0, topN).map((s, i) => ({ ...s, rank: i + 1 }))
}