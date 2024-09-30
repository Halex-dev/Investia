import { axiosInstance } from '@/lib/axios'
import { Transaction, UpdateTransaction } from '@/types/transaction'

export const transactionService = {
  async getAll(startDate: Date, endDate: Date): Promise<Transaction[]> {
    const response = await axiosInstance.get('/transactions', {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    })
    return response.data
  },

  async create(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const response = await axiosInstance.post('/transactions', transaction)
    return response.data
  },

  async update(
    id: string,
    transaction: Partial<Transaction>
  ): Promise<Transaction> {
    const adaptedTransaction = this.adaptToUpdateDto(transaction)
    const response = await axiosInstance.put(
      `/transactions/${id}`,
      adaptedTransaction
    )
    return response.data
  },
  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/transactions/${id}`)
  },

  adaptToUpdateDto(transaction: Partial<Transaction>): UpdateTransaction {
    const updateKeys: (keyof UpdateTransaction)[] = [
      'amount',
      'type',
      'date',
      'description',
      'categoryId',
      'isRecurring',
      'recurringFrequency',
      'isAmortized',
      'amortizationMonths',
    ]

    return updateKeys.reduce((dto, key) => {
      if (key in transaction) {
        if (key === 'date') {
          const dateValue: Date = transaction[key]?.valueOf() as any

          dto[key] = dateValue
        } else {
          const value = transaction[key as keyof Transaction]
          if (value !== undefined) {
            ;(dto as any)[key] = value
          }
        }
      }
      return dto
    }, {} as UpdateTransaction)
  },
}
