import React from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Transaction, TransactionType } from '@/types/transaction'
import { formatDate } from '@/lib/utils'

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
}) => {
  const t = useTranslations('Dashboard')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('recentTransactions')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {transactions.slice(0, 5).map((transaction) => (
            <li
              key={transaction.id}
              className="flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{transaction.category?.name}</p>
                <p className="text-sm text-gray-500">
                  {transaction.description
                    ? `${transaction.description} - ${formatDate(transaction.date)}`
                    : formatDate(transaction.date)}
                </p>
              </div>
              <span
                className={
                  transaction.type === TransactionType.INCOME
                    ? 'text-green-600'
                    : 'text-red-600'
                }
              >
                {transaction.type === TransactionType.INCOME ? '+' : '-'}$
                {Math.abs(transaction.amount).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
