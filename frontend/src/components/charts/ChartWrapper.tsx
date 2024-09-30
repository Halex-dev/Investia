import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface ChartWrapperProps {
  title: string
  isLoading: boolean
  children: React.ReactNode
}

export const ChartWrapper: React.FC<ChartWrapperProps> = ({
  title,
  isLoading,
  children,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-[300px] w-full" /> : children}
      </CardContent>
    </Card>
  )
}
