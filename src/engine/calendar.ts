import { Holiday, DayInfo } from './types'

function pad(n: number): string {
  return n < 10 ? '0' + n : String(n)
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function buildYearCalendar(
  year: number,
  holidays: Holiday[]
): DayInfo[] {
  const holidayMap = new Map<string, string>()
  for (const h of holidays) {
    holidayMap.set(h.date, h.name)
  }

  const days: DayInfo[] = []
  const start = new Date(year, 0, 1)

  for (let doy = 0; doy < 365; doy++) {
    const date = new Date(year, 0, 1 + doy)
    const key = formatDate(date)
    const isSunday = date.getDay() === 0
    const holidayName = holidayMap.get(key) ?? null
    days.push({
      date,
      isSunday,
      isHoliday: holidayName !== null,
      holidayName,
      dayOfYear: doy,
    })
  }

  return days
}

export function isNonWorkingDay(day: DayInfo): boolean {
  return day.isSunday || day.isHoliday
}

export function getConsecutiveNonWorkingBefore(
  days: DayInfo[],
  startDayOfYear: number
): number {
  let count = 0
  let i = startDayOfYear - 1
  while (i >= 0 && isNonWorkingDay(days[i])) {
    count++
    i--
  }
  return count
}

export function getConsecutiveNonWorkingAfter(
  days: DayInfo[],
  endDayOfYear: number
): number {
  let count = 0
  let i = endDayOfYear + 1
  while (i < days.length && isNonWorkingDay(days[i])) {
    count++
    i++
  }
  return count
}

export function isStartDateValid(days: DayInfo[], startDayOfYear: number): boolean {
  if (startDayOfYear < 0 || startDayOfYear >= days.length) return false
  if (isNonWorkingDay(days[startDayOfYear])) return false
  if (startDayOfYear - 1 >= 0 && isNonWorkingDay(days[startDayOfYear - 1])) return false
  if (startDayOfYear - 2 >= 0 && isNonWorkingDay(days[startDayOfYear - 2])) return false
  return true
}
