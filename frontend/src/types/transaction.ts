import { Category } from './category'

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  INVESTMENT = 'investment',
}

export type UpdateTransaction = {
  amount?: number
  type?: TransactionType
  date?: Date
  description?: string
  categoryId?: string
  isRecurring?: boolean
  recurringFrequency?: string
  isAmortized?: boolean
  amortizationMonths?: number
}

export interface Transaction {
  id: string
  amount: number
  type: TransactionType
  date: string
  description: string
  categoryId: string
  isRecurring: boolean
  isAmortized: boolean
  recurringFrequency?: string
  amortizationMonths?: number

  //RElazioni
  category?: Category
}
