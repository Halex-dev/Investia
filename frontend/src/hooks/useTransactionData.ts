// hooks/useTransactionData.ts
import { useState, useEffect } from 'react'
import { transactionService } from '@/lib/api/transactions'
import { categoryService } from '@/lib/api/category'
import { startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns'
import { Transaction } from '@/types/transaction'
import { Category } from '@/types/category'

export function useTransactionData(currentMonth: Date, user: any) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [previousTransactions, setPreviousTransactions] = useState<
    Transaction[]
  >([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [currentMonth, user?.monthStartDay])

  const loadData = async () => {
    setIsLoading(true)
    const monthStart = startOfMonth(currentMonth)
    monthStart.setDate(user?.monthStartDay || 1)
    const monthEnd = endOfMonth(addMonths(monthStart, 1))
    monthEnd.setDate((user?.monthStartDay || 1) - 1)

    const previousMonthStart = startOfMonth(subMonths(monthStart, 1))

    try {
      const [
        fetchedTransactions,
        fetchedCategories,
        fetchPreviousTransactions,
      ] = await Promise.all([
        transactionService.getAll(monthStart, monthEnd),
        categoryService.getAll(),
        transactionService.getAll(previousMonthStart, monthStart),
      ])

      setTransactions(fetchedTransactions.map(processTransaction))
      setPreviousTransactions(fetchPreviousTransactions.map(processTransaction))
      setCategories(fetchedCategories)
    } catch (error) {
      console.error('Error loading data:', error)
      // TODO gestire l'errore, ad esempio mostrando un messaggio all'utente
    } finally {
      setIsLoading(false)
    }
  }

  return { transactions, previousTransactions, categories, isLoading }
}

function processTransaction(transaction: Transaction): Transaction {
  return {
    ...transaction,
    amount: parseFloat(String(transaction.amount)),
  }
}
