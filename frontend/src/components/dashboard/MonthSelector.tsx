import React from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface MonthSelectorProps {
  currentMonth: Date
  onPrevMonth: () => void
  onNextMonth: () => void
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  currentMonth,
  onPrevMonth,
  onNextMonth,
}) => {
  return (
    <div className="mb-6 flex items-center justify-center space-x-4">
      <Button variant="outline" size="icon" onClick={onPrevMonth}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-lg font-semibold">
        {format(currentMonth, 'MMMM yyyy')}
      </span>
      <Button variant="outline" size="icon" onClick={onNextMonth}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
