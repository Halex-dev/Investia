'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { transactionService } from '@/lib/api/transactions'
import { categoryService } from '@/lib/api/category'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpDown,
} from 'lucide-react'
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
} from 'date-fns'
import { useAuth } from '@/context/AuthContext'
import { Category } from '@/types/category'
import { Transaction, TransactionType } from '@/types/transaction'
import { convertCurrency } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type SortableField = 'amount' | 'type' | 'date' | 'description'

type SortConfig = {
  key: SortableField
  direction: 'asc' | 'desc'
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    type: TransactionType.EXPENSE,
    date: format(new Date(), 'yyyy-MM-dd'),
    isRecurring: false,
    isAmortized: false,
  })
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'date',
    direction: 'desc',
  })
  const { user } = useAuth()
  const t = useTranslations('Transactions')

  useEffect(() => {
    loadTransactions()
    loadCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth, user?.monthStartDay])

  const loadTransactions = async () => {
    const monthStart = startOfMonth(currentMonth)
    monthStart.setDate(user?.monthStartDay || 1)
    const monthEnd = endOfMonth(addMonths(monthStart, 1))
    monthEnd.setDate((user?.monthStartDay || 1) - 1)

    const fetchedTransactions = await transactionService.getAll(
      monthStart,
      monthEnd
    )

    setTransactions(fetchedTransactions)
  }

  const loadCategories = async () => {
    const fetchedCategories = await categoryService.getAll()
    setCategories(fetchedCategories)
  }

  const handleCreateTransaction = async () => {
    await transactionService.create(newTransaction as Omit<Transaction, 'id'>)
    setNewTransaction({
      type: TransactionType.EXPENSE,
      date: format(new Date(), 'yyyy-MM-dd'),
      isRecurring: false,
      isAmortized: false,
    })
    loadTransactions()
  }

  const handleUpdateTransaction = async () => {
    if (editingTransaction) {
      await transactionService.update(editingTransaction.id, editingTransaction)
      setEditingTransaction(null)
      setIsDialogOpen(false)
      loadTransactions()
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    if (confirm(t('deleteConfirmation'))) {
      await transactionService.delete(id)
      loadTransactions()
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prevMonth) =>
      direction === 'prev' ? subMonths(prevMonth, 1) : addMonths(prevMonth, 1)
    )
  }

  const filteredAndSortedTransactions = useMemo(() => {
    return transactions
      .filter((transaction) => {
        const matchesTab =
          activeTab === 'all' || transaction.type.toLowerCase() === activeTab
        const matchesSearch =
          transaction.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.category?.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        return matchesTab && matchesSearch
      })
      .sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === 'asc' ? -1 : 1
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
  }, [transactions, activeTab, searchTerm, sortConfig])

  const requestSort = (key: SortableField) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    }))
  }
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">{t('title')}</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('newTransaction')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Input
              type="number"
              placeholder={t('amount')}
              value={newTransaction.amount || ''}
              onChange={(e) =>
                setNewTransaction({
                  ...newTransaction,
                  amount: parseFloat(e.target.value),
                })
              }
            />
            <Select
              value={newTransaction.type}
              onValueChange={(value) =>
                setNewTransaction({
                  ...newTransaction,
                  type: value as TransactionType,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t('selectType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TransactionType.INCOME}>
                  {t('income')}
                </SelectItem>
                <SelectItem value={TransactionType.EXPENSE}>
                  {t('expense')}
                </SelectItem>
                <SelectItem value={TransactionType.INVESTMENT}>
                  {t('investment')}
                </SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={newTransaction.date}
              onChange={(e) =>
                setNewTransaction({ ...newTransaction, date: e.target.value })
              }
            />
            <Input
              placeholder={t('description')}
              value={newTransaction.description || ''}
              onChange={(e) =>
                setNewTransaction({
                  ...newTransaction,
                  description: e.target.value,
                })
              }
            />
            <Select
              value={newTransaction.categoryId}
              onValueChange={(value) =>
                setNewTransaction({ ...newTransaction, categoryId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t('selectCategory')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRecurring"
                checked={newTransaction.isRecurring}
                onCheckedChange={(checked: boolean) =>
                  setNewTransaction({
                    ...newTransaction,
                    isRecurring: checked as boolean,
                  })
                }
              />
              <label htmlFor="isRecurring">{t('isRecurring')}</label>
            </div>
            {newTransaction.isRecurring && (
              <Select
                value={newTransaction.recurringFrequency}
                onValueChange={(value) =>
                  setNewTransaction({
                    ...newTransaction,
                    recurringFrequency: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectFrequency')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">{t('daily')}</SelectItem>
                  <SelectItem value="weekly">{t('weekly')}</SelectItem>
                  <SelectItem value="monthly">{t('monthly')}</SelectItem>
                  <SelectItem value="yearly">{t('yearly')}</SelectItem>
                </SelectContent>
              </Select>
            )}
            {newTransaction.type === TransactionType.EXPENSE && (
              <>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isAmortized"
                    checked={newTransaction.isAmortized}
                    onCheckedChange={(checked: boolean) =>
                      setNewTransaction({
                        ...newTransaction,
                        isAmortized: checked as boolean,
                        amortizationMonths: checked ? 2 : undefined,
                      })
                    }
                  />
                  <label htmlFor="isAmortized">{t('isAmortized')}</label>
                </div>
                {newTransaction.isAmortized && (
                  <Input
                    type="number"
                    placeholder={t('amortizationMonths')}
                    value={newTransaction.amortizationMonths || ''}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        amortizationMonths: parseInt(e.target.value),
                      })
                    }
                    min="2"
                  />
                )}
              </>
            )}
            <Button onClick={handleCreateTransaction}>
              <Plus className="mr-2 h-4 w-4" /> {t('create')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mb-4 flex items-center justify-between">
        <Button onClick={() => navigateMonth('prev')}>
          <ChevronLeft className="mr-2 h-4 w-4" /> {t('previousMonth')}
        </Button>
        <h2 className="text-xl font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <Button onClick={() => navigateMonth('next')}>
          {t('nextMonth')} <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">{t('all')}</TabsTrigger>
            <TabsTrigger value="income">{t('income')}</TabsTrigger>
            <TabsTrigger value="expense">{t('expense')}</TabsTrigger>
            <TabsTrigger value="investment">{t('investment')}</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400" />
          <Input
            type="text"
            placeholder={t('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 py-2 pl-10 pr-4"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer"
              onClick={() => requestSort('amount')}
            >
              {t('amount')} <ArrowUpDown className="ml-1 inline h-4 w-4" />
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => requestSort('type')}
            >
              {t('type')} <ArrowUpDown className="ml-1 inline h-4 w-4" />
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => requestSort('date')}
            >
              {t('date')} <ArrowUpDown className="ml-1 inline h-4 w-4" />
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => requestSort('description')}
            >
              {t('description')} <ArrowUpDown className="ml-1 inline h-4 w-4" />
            </TableHead>
            <TableHead>{t('category')}</TableHead>
            <TableHead>{t('recurring')}</TableHead>
            <TableHead>{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedTransactions.map((transaction) => (
            <TableRow
              key={transaction.id}
              className="transition-colors hover:bg-gray-100"
            >
              <TableCell
                className={`font-semibold ${
                  transaction.type === TransactionType.INCOME
                    ? 'text-green-600'
                    : transaction.type === TransactionType.EXPENSE
                      ? 'text-red-600'
                      : 'text-blue-600'
                }`}
              >
                {convertCurrency(transaction.amount)}
              </TableCell>
              <TableCell>{t(transaction.type)}</TableCell>
              <TableCell>
                {format(new Date(transaction.date), 'dd/MM/yyyy')}
              </TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell>{transaction.category?.name}</TableCell>
              <TableCell>
                {transaction.isRecurring ? t('yes') : t('no')}
              </TableCell>
              <TableCell>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEditingTransaction(transaction)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('editTransaction')}</DialogTitle>
                    </DialogHeader>
                    {editingTransaction && (
                      <div className="grid gap-4 py-4">
                        <Input
                          type="number"
                          value={editingTransaction.amount}
                          onChange={(e) =>
                            setEditingTransaction({
                              ...editingTransaction,
                              amount: parseFloat(e.target.value),
                            })
                          }
                        />
                        <Select
                          value={editingTransaction.type}
                          onValueChange={(value) =>
                            setEditingTransaction({
                              ...editingTransaction,
                              type: value as TransactionType,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectType')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={TransactionType.INCOME}>
                              {t('income')}
                            </SelectItem>
                            <SelectItem value={TransactionType.EXPENSE}>
                              {t('expense')}
                            </SelectItem>
                            <SelectItem value={TransactionType.INVESTMENT}>
                              {t('investment')}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="date"
                          value={editingTransaction.date}
                          onChange={(e) =>
                            setEditingTransaction({
                              ...editingTransaction,
                              date: e.target.value,
                            })
                          }
                        />
                        <Input
                          value={editingTransaction.description || ''}
                          onChange={(e) =>
                            setEditingTransaction({
                              ...editingTransaction,
                              description: e.target.value,
                            })
                          }
                        />
                        <Select
                          value={editingTransaction.categoryId}
                          onValueChange={(value) =>
                            setEditingTransaction({
                              ...editingTransaction,
                              categoryId: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectCategory')} />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="editIsRecurring"
                            checked={editingTransaction.isRecurring}
                            onCheckedChange={(checked: boolean) =>
                              setEditingTransaction({
                                ...editingTransaction,
                                isRecurring: checked as boolean,
                              })
                            }
                          />
                          <label htmlFor="editIsRecurring">
                            {t('isRecurring')}
                          </label>
                        </div>
                        {editingTransaction.isRecurring && (
                          <Select
                            value={editingTransaction.recurringFrequency}
                            onValueChange={(value) =>
                              setEditingTransaction({
                                ...editingTransaction,
                                recurringFrequency: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t('selectFrequency')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">
                                {t('daily')}
                              </SelectItem>
                              <SelectItem value="weekly">
                                {t('weekly')}
                              </SelectItem>
                              <SelectItem value="monthly">
                                {t('monthly')}
                              </SelectItem>
                              <SelectItem value="yearly">
                                {t('yearly')}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        {editingTransaction.type ===
                          TransactionType.EXPENSE && (
                          <>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="editIsAmortized"
                                checked={editingTransaction.isAmortized}
                                onCheckedChange={(checked: boolean) =>
                                  setEditingTransaction({
                                    ...editingTransaction,
                                    isAmortized: checked as boolean,
                                    amortizationMonths: checked
                                      ? editingTransaction.amortizationMonths ||
                                        1
                                      : undefined,
                                  })
                                }
                              />
                              <label htmlFor="editIsAmortized">
                                {t('isAmortized')}
                              </label>
                            </div>
                            {editingTransaction.isAmortized && (
                              <Input
                                type="number"
                                placeholder={t('amortizationMonths')}
                                value={
                                  editingTransaction.amortizationMonths || ''
                                }
                                onChange={(e) =>
                                  setEditingTransaction({
                                    ...editingTransaction,
                                    amortizationMonths: parseInt(
                                      e.target.value
                                    ),
                                  })
                                }
                                min="1"
                              />
                            )}
                          </>
                        )}
                        <Button onClick={handleUpdateTransaction}>
                          {t('update')}
                        </Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteTransaction(transaction.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
