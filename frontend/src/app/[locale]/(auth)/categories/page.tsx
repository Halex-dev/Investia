'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { categoryService } from '@/lib/api/category'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Edit, Trash2, RefreshCw, Search } from 'lucide-react'
import { generateRandomColor } from '@/lib/utils'
import { Category, CategoryType } from '@/types/category'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: generateRandomColor(),
    type: CategoryType.ESSENTIAL,
  })
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<CategoryType | 'all'>('all')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  )
  const t = useTranslations('Categories')

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    const fetchedCategories = await categoryService.getAll()
    setCategories(fetchedCategories)
  }

  const handleCreateCategory = async () => {
    await categoryService.create(
      newCategory.name,
      newCategory.color,
      newCategory.type
    )
    setNewCategory({
      name: '',
      color: generateRandomColor(),
      type: CategoryType.ESSENTIAL,
    })
    loadCategories()
  }

  const handleUpdateCategory = async () => {
    if (editingCategory) {
      await categoryService.update(
        editingCategory.id,
        editingCategory.name,
        editingCategory.color,
        editingCategory.type
      )
      setEditingCategory(null)
      loadCategories()
    }
  }

  const handleDeleteCategory = async () => {
    if (categoryToDelete) {
      await categoryService.delete(categoryToDelete.id)
      setCategoryToDelete(null)
      setIsDeleteDialogOpen(false)
      loadCategories()
    }
  }

  const filteredCategories = useMemo(() => {
    return categories.filter(
      (category) =>
        (activeTab === 'all' || category.type === activeTab) &&
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [categories, activeTab, searchTerm])

  const renderCategoryTypeSelect = (
    value: CategoryType,
    onChange: (value: CategoryType) => void
  ) => (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={t('selectType')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={CategoryType.ESSENTIAL}>{t('essential')}</SelectItem>
        <SelectItem value={CategoryType.OPTIONAL}>{t('optional')}</SelectItem>
        <SelectItem value={CategoryType.SHORT_TERM_INVESTMENT}>
          {t('short_term_investment')}
        </SelectItem>
        <SelectItem value={CategoryType.LONG_TERM_INVESTMENT}>
          {t('long_term_investment')}
        </SelectItem>
      </SelectContent>
    </Select>
  )

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-3xl font-bold">{t('title')}</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('newCategory')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              placeholder={t('categoryName')}
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory({ ...newCategory, name: e.target.value })
              }
            />
            <div className="flex items-center space-x-2">
              <Input
                type="color"
                value={newCategory.color}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, color: e.target.value })
                }
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setNewCategory({
                    ...newCategory,
                    color: generateRandomColor(),
                  })
                }
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            {renderCategoryTypeSelect(newCategory.type, (value) =>
              setNewCategory({ ...newCategory, type: value as CategoryType })
            )}
            <Button onClick={handleCreateCategory}>
              <Plus className="mr-2 h-4 w-4" /> {t('create')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mb-4 flex justify-between">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as CategoryType | 'all')}
        >
          <TabsList>
            <TabsTrigger value="all">{t('all')}</TabsTrigger>
            <TabsTrigger value={CategoryType.ESSENTIAL}>
              {t('essential')}
            </TabsTrigger>
            <TabsTrigger value={CategoryType.OPTIONAL}>
              {t('optional')}
            </TabsTrigger>
            <TabsTrigger value={CategoryType.SHORT_TERM_INVESTMENT}>
              {t('short_term_investment')}
            </TabsTrigger>
            <TabsTrigger value={CategoryType.LONG_TERM_INVESTMENT}>
              {t('long_term_investment')}
            </TabsTrigger>
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

      {filteredCategories.length === 0 && (
        <Alert className="mb-4">
          <AlertTitle>{t('noResultsTitle')}</AlertTitle>
          <AlertDescription>{t('noResultsDescription')}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {editingCategory?.id === category.id ? (
                  <Input
                    value={editingCategory.name}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        name: e.target.value,
                      })
                    }
                  />
                ) : (
                  <span>{category.name}</span>
                )}
                <div
                  className="h-6 w-6 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                {editingCategory?.id === category.id ? (
                  renderCategoryTypeSelect(editingCategory.type, (value) =>
                    setEditingCategory({
                      ...editingCategory,
                      type: value as CategoryType,
                    })
                  )
                ) : (
                  <span className="text-sm text-gray-500">
                    {t(category.type)}
                  </span>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                {editingCategory?.id === category.id ? (
                  <>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="color"
                        value={editingCategory.color}
                        onChange={(e) =>
                          setEditingCategory({
                            ...editingCategory,
                            color: e.target.value,
                          })
                        }
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setEditingCategory({
                            ...editingCategory,
                            color: generateRandomColor(),
                          })
                        }
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button onClick={handleUpdateCategory}>{t('save')}</Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingCategory(null)}
                    >
                      {t('cancel')}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setEditingCategory(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                <Dialog
                  open={isDeleteDialogOpen}
                  onOpenChange={setIsDeleteDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      onClick={() => setCategoryToDelete(category)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('deleteConfirmation')}</DialogTitle>
                    </DialogHeader>
                    <p>
                      {t('deleteWarning', { category: categoryToDelete?.name })}
                    </p>
                    <div className="mt-4 flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsDeleteDialogOpen(false)}
                      >
                        {t('cancel')}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteCategory}
                      >
                        {t('delete')}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
