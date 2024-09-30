import React from 'react'
import { useTranslations } from 'next-intl'
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

interface MonthlyComparisonProps {
  currentMonth: { [category: string]: number }
  previousMonth: { [category: string]: number }
}

export const MonthlyComparison: React.FC<MonthlyComparisonProps> = ({
  currentMonth,
  previousMonth,
}) => {
  const t = useTranslations('Dashboard')

  const data = Object.keys({ ...currentMonth, ...previousMonth }).map(
    (category) => ({
      name: category,
      current: currentMonth[category] || 0,
      previous: previousMonth[category] || 0,
    })
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('monthlyComparison')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="current" name={t('currentMonth')} fill="#8884d8" />
            <Bar dataKey="previous" name={t('previousMonth')} fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
