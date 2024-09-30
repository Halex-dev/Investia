'use client'

import React, { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  addMonths,
  parseISO,
} from 'date-fns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useTransactionData } from '@/hooks/useTransactionData'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuth } from '@/context/AuthContext'
import { Transaction, TransactionType } from '@/types/transaction'
import { Category, CategoryType } from '@/types/category'
import { MonthSelector } from '@/components/dashboard/MonthSelector'
import { TotalCard } from '@/components/dashboard/TotalCard'
import { ChartWrapper } from '@/components/charts/ChartWrapper'
import { FinanceRules } from '@/components/dashboard/FinanceRules'
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { MonthlyComparison } from '@/components/dashboard/MonthlyComparison'
import ErrorBoundary from '@/components/common/ErrorBoundary'

interface TotalsType {
  [TransactionType.INCOME]: number
  [TransactionType.EXPENSE]: number
  [TransactionType.INVESTMENT]: number
}

interface MonthlyData {
  name: string
  income: number
  expenses: number
}

interface ExpenseData {
  month: string
  expenses: number
}

export default function DashboardPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const { user } = useAuth()
  const t = useTranslation('Dashboard')
  const { transactions, previousTransactions, categories, isLoading } =
    useTransactionData(currentMonth, user)

  const totals = useMemo<TotalsType>(() => {
    return transactions.reduce(
      (acc, transaction) => {
        acc[transaction.type] += transaction.amount
        return acc
      },
      {
        [TransactionType.INCOME]: 0,
        [TransactionType.EXPENSE]: 0,
        [TransactionType.INVESTMENT]: 0,
      }
    )
  }, [transactions])

  const categoryData = useMemo(() => {
    const categoryTotals = transactions.reduce<Record<string, number>>(
      (acc, transaction) => {
        if (transaction.type === TransactionType.EXPENSE) {
          const category = categories.find(
            (c) => c.id === transaction.categoryId
          )
          const categoryName = category ? category.name : 'Uncategorized'
          acc[categoryName] =
            (acc[categoryName] || 0) + Number(transaction.amount)
        }
        return acc
      },
      {}
    )

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
    }))
  }, [transactions, categories])

  const monthlyTrendData = useMemo<MonthlyData[]>(() => {
    const monthlyData: MonthlyData[] = []
    for (let i = 5; i >= 0; i--) {
      const month = subMonths(currentMonth, i)
      const monthTransactions = transactions.filter(
        (t) =>
          new Date(t.date).getMonth() === month.getMonth() &&
          new Date(t.date).getFullYear() === month.getFullYear()
      )

      const income = parseFloat(
        monthTransactions
          .filter((t) => t.type === TransactionType.INCOME)
          .reduce((sum, t) => sum + t.amount, 0)
          .toFixed(2)
      )

      const expenses = parseFloat(
        monthTransactions
          .filter((t) => t.type === TransactionType.EXPENSE)
          .reduce((sum, t) => sum + t.amount, 0)
          .toFixed(2)
      )

      monthlyData.push({
        name: format(month, 'MMM'),
        income,
        expenses,
      })
    }
    return monthlyData
  }, [transactions, currentMonth])

  const financeRules = useMemo(() => {
    const totalIncome = Number(totals[TransactionType.INCOME]) || 0
    const expenses = transactions.filter(
      (t) => t.type === TransactionType.EXPENSE
    )

    const essentialExpenses = expenses
      .filter((t) => {
        const category = categories.find((c) => c.id === t.categoryId)
        return category?.type === CategoryType.ESSENTIAL
      })
      .reduce((sum, t) => sum + t.amount, 0)

    const optionalExpenses = expenses
      .filter((t) => {
        const category = categories.find((c) => c.id === t.categoryId)
        return category?.type === CategoryType.OPTIONAL
      })
      .reduce((sum, t) => sum + t.amount, 0)

    const investments = Number(totals[TransactionType.INVESTMENT]) || 0

    return {
      essential: totalIncome > 0 ? essentialExpenses : 0,
      optional: totalIncome > 0 ? optionalExpenses : 0,
      investments: totalIncome > 0 ? investments : 0,
    }
  }, [totals, transactions, categories])

  const currentMonthExpenses = useMemo(() => {
    return transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce<Record<string, number>>((acc, t) => {
        const category =
          categories.find((c) => c.id === t.categoryId)?.name || 'Uncategorized'
        acc[category] = (acc[category] || 0) + t.amount
        return acc
      }, {})
  }, [transactions, categories])

  const previousMonthExpenses = useMemo(() => {
    return previousTransactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce<Record<string, number>>((acc, t) => {
        const category =
          categories.find((c) => c.id === t.categoryId)?.name || 'Uncategorized'
        acc[category] = (acc[category] || 0) + t.amount
        return acc
      }, {})
  }, [previousTransactions, categories])

  return (
    <ErrorBoundary
      fallback={<div>Si è verificato un errore. Riprova più tardi.</div>}
    >
      <div className="container mx-auto space-y-8 p-4">
        <h1 className="text-3xl font-bold">{t('title')}</h1>

        <MonthSelector
          currentMonth={currentMonth}
          onPrevMonth={() =>
            setCurrentMonth((prevMonth) => subMonths(prevMonth, 1))
          }
          onNextMonth={() =>
            setCurrentMonth((prevMonth) => addMonths(prevMonth, 1))
          }
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <TotalCard
            title={t('totalIncome')}
            amount={totals[TransactionType.INCOME]}
            color="text-green-600"
            isLoading={isLoading}
          />
          <TotalCard
            title={t('totalExpenses')}
            amount={totals[TransactionType.EXPENSE]}
            color="text-red-600"
            isLoading={isLoading}
          />
          <TotalCard
            title={t('totalInvestments')}
            amount={totals[TransactionType.INVESTMENT]}
            color="text-blue-600"
            isLoading={isLoading}
          />
        </div>

        <Tabs defaultValue="monthly" className="space-y-4">
          <TabsList>
            <TabsTrigger value="monthly">{t('monthlyTrend')}</TabsTrigger>
            <TabsTrigger value="category">{t('categoryBreakdown')}</TabsTrigger>
          </TabsList>
          <TabsContent value="monthly">
            <ChartWrapper title={t('monthlyTrend')} isLoading={isLoading}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="income" fill="#82ca9d" name={t('income')} />
                  <Bar dataKey="expenses" fill="#8884d8" name={t('expenses')} />
                </BarChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </TabsContent>
          <TabsContent value="category">
            <CategoryBreakdown data={categoryData} />
          </TabsContent>
        </Tabs>

        <FinanceRules
          totalIncome={Number(totals[TransactionType.INCOME]) || 0}
          essential={financeRules.essential}
          optional={financeRules.optional}
          investments={financeRules.investments}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <RecentTransactions transactions={transactions.slice(0, 5)} />
          <MonthlyComparison
            currentMonth={currentMonthExpenses}
            previousMonth={previousMonthExpenses}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('financialTips')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5">
              {[1, 2, 3, 4].map((i) => (
                <li key={i}>{t(`tip${i}`)}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  )
}
