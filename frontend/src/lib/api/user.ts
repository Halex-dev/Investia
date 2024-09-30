import { axiosInstance } from '@/lib/axios'
import { User } from '@/types/userPayload'

export const userService = {
  async update(user: Partial<User>): Promise<User> {
    const response = await axiosInstance.put(`/users/update`, user)
    return response.data
  },
}
