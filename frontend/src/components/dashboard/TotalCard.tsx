import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface TotalCardProps {
  title: string
  amount: number | undefined
  color: string
  isLoading: boolean
}

export const TotalCard: React.FC<TotalCardProps> = ({
  title,
  amount,
  color,
  isLoading,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <p className={`text-2xl font-bold ${color}`}>
            ${amount !== undefined ? amount.toFixed(2) : '0.00'}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
