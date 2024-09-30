import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { it, enUS } from 'date-fns/locale'

function parseMoneyValue(value: string | number): number {
  if (typeof value === 'string') {
    // Sostituiamo la virgola con il punto, se presente
    const normalizedValue = value.replace(',', '.')
    return parseFloat(normalizedValue)
  }
  return value
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertCurrency(amount: number | string): string {
  // Converti la stringa in numero se necessario
  const numericAmount = parseMoneyValue(amount)

  // Verifica se il valore è un numero valido
  if (isNaN(numericAmount)) {
    throw new Error(
      'Input non valido. Inserire un numero o una stringa numerica.'
    )
  }

  // Formatta il numero come valuta
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(numericAmount)
}

export function generateRandomColor(): string {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

export function formatDate(
  date: string | Date,
  localeString: string = 'it'
): string {
  const dateObject = typeof date === 'string' ? parseISO(date) : date
  const locale = localeString === 'it' ? it : enUS

  return format(dateObject, 'PPP', { locale })
}

export function sumMoney(a: string | number, b: string | number): number {
  const valueA = parseMoneyValue(a)
  const valueB = parseMoneyValue(b)

  if (isNaN(valueA) || isNaN(valueB)) {
    throw new Error(
      'Input non valido. Inserire numeri o stringhe numeriche valide.'
    )
  }

  // Usiamo toFixed(2) per limitare a due decimali e poi convertiamo di nuovo in numero
  return Number((valueA + valueB).toFixed(2))
}
