import { axiosInstance } from '@/lib/axios'
import { Category, CategoryType } from '@/types/category'

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const response = await axiosInstance.get('/categories')
    return response.data
  },

  async create(
    name: string,
    color: string,
    type: CategoryType
  ): Promise<Category> {
    const response = await axiosInstance.post('/categories', {
      name,
      color,
      type,
    })
    return response.data
  },

  async update(
    id: string,
    name: string,
    color: string,
    type: CategoryType
  ): Promise<Category> {
    const response = await axiosInstance.put(`${'/categories'}/${id}`, {
      name,
      color,
      type,
    })
    return response.data
  },

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`${'/categories'}/${id}`)
  },
}
