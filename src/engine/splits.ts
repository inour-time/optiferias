import { SplitPattern } from './types'

export function generateSplits(balance: number): SplitPattern[] {
  const splits: SplitPattern[] = []
  const seen = new Set<string>()

  if (balance < 19) {
    if (balance >= 5) {
      splits.push({ periodA: balance, periodB: 0, label: `${balance}` })
    }
    return splits
  }

  for (let a = 5; a <= balance - 5; a++) {
    const b = balance - a
    if ((a >= 14 && b >= 5) || (a >= 5 && b >= 14)) {
      const key = `${Math.min(a, b)}-${Math.max(a, b)}`
      if (!seen.has(key)) {
        seen.add(key)
        splits.push({ periodA: a, periodB: b, label: `${a} + ${b}` })
      }
    }
  }

  splits.sort((x, y) => Math.abs(x.periodA - x.periodB) - Math.abs(y.periodA - y.periodB))

  return splits
}

export function parseCustomSplit(balance: number, input: string): { split: SplitPattern; error: null } | { split: null; error: string } {
  const trimmed = input.replace(/\s/g, '')

  if (balance < 19) {
    const n = Number(trimmed)
    if (isNaN(n) || !Number.isInteger(n) || n !== balance) {
      return { split: null, error: `Para ${balance} dias, use apenas: ${balance}` }
    }
    if (n < 5) {
      return { split: null, error: 'Período mínimo é 5 dias.' }
    }
    return { split: { periodA: n, periodB: 0, label: `${n}` }, error: null }
  }

  const parts = trimmed.split('+')
  if (parts.length !== 2) {
    return { split: null, error: 'Use o formato: 14+16 (dois números separados por +)' }
  }

  const a = Number(parts[0])
  const b = Number(parts[1])

  if (isNaN(a) || isNaN(b) || !Number.isInteger(a) || !Number.isInteger(b)) {
    return { split: null, error: 'Digite apenas números inteiros.' }
  }
  if (a < 1 || b < 1) {
    return { split: null, error: 'Os períodos devem ser maiores que zero.' }
  }
  if (a + b !== balance) {
    return { split: null, error: `A soma deve ser ${balance} (você digitou ${a}+${b}=${a + b})` }
  }
  if (!((a >= 14 && b >= 5) || (a >= 5 && b >= 14))) {
    return { split: null, error: 'Um período deve ter no mínimo 14 dias e o outro no mínimo 5 dias.' }
  }

  return { split: { periodA: a, periodB: b, label: `${a} + ${b}` }, error: null }
}
