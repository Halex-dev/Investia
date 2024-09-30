import React from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { convertCurrency } from '@/lib/utils'

interface FinanceRulesProps {
  totalIncome: number
  essential: number
  optional: number
  investments: number
}

export const FinanceRules: React.FC<FinanceRulesProps> = ({
  totalIncome,
  essential,
  optional,
  investments,
}) => {
  const t = useTranslations('Dashboard')

  const savings = totalIncome - (essential + optional + investments)

  const getPercentage = (amount: number) => (amount / totalIncome) * 100
  const getTargetAmount = (target: number) => (totalIncome * target) / 100
  const getProgressColor = (
    amount: number,
    target: number,
    isSavings: boolean
  ) => {
    const ratio = amount / target
    if (isSavings) {
      if (ratio >= 1) return 'bg-green-600'
      if (ratio >= 0.8) return 'bg-yellow-600'
      return 'bg-red-600'
    } else {
      if (ratio <= 0.8) return 'bg-green-600'
      if (ratio <= 1) return 'bg-yellow-600'
      return 'bg-red-600'
    }
  }

  const renderProgressBar = (
    amount: number,
    target: number,
    isSavings: boolean
  ) => {
    const progressPercentage = isSavings
      ? Math.min((amount / target) * 100, 100)
      : Math.min((amount / target) * 100, 100)
    const progressColor = getProgressColor(amount, target, isSavings)
    return (
      <div className="mt-2 w-full rounded bg-gray-200">
        <div
          className={`h-2 rounded ${progressColor}`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    )
  }

  const rule502020 = [
    { key: 'essential', target: 50 },
    { key: 'optional', target: 30 },
    { key: 'investments', target: 20 },
  ]

  const rule702010 = [
    { key: 'essential', target: 70 },
    { key: 'savings', target: 20 },
    { key: 'optional', target: 10 },
  ]

  const renderRuleContent = (rules: Array<{ key: string; target: number }>) => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {rules.map(({ key, target }) => {
        const amount = key === 'savings' ? savings : eval(key)
        const percentage = getPercentage(amount)
        const targetAmount = getTargetAmount(target)
        const isSavings = key === 'savings'

        return (
          <div key={key}>
            <p className="font-semibold">
              {t(key)}: {percentage.toFixed(1)}%
            </p>
            <p className="text-sm">
              {t('amount')}: {convertCurrency(amount.toFixed(2))} /{' '}
              {convertCurrency(targetAmount.toFixed(2))}
            </p>
            {renderProgressBar(amount, targetAmount, isSavings)}
            <p className="mt-1 text-sm text-gray-500">
              {t('target')}: {target}%
            </p>
          </div>
        )
      })}
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('financeRules')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="502020">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="502020">50/30/20</TabsTrigger>
            <TabsTrigger value="702010">70/20/10</TabsTrigger>
          </TabsList>
          <TabsContent value="502020">
            <h3 className="mb-2 text-lg font-semibold">{t('rule50-30-20')}</h3>
            {renderRuleContent(rule502020)}
          </TabsContent>
          <TabsContent value="702010">
            <h3 className="mb-2 text-lg font-semibold">{t('rule70-20-10')}</h3>
            {renderRuleContent(rule702010)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
