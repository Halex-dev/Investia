import { User } from '@/types/userPayload'
import { axiosInstance } from './axios'

export const login = async (
  identifier: string,
  password: string
): Promise<void> => {
  await axiosInstance.post('/auth/login', { identifier, password })
}

export const logout = async (): Promise<void> => {
  await axiosInstance.post('/auth/logout')
}

export const refreshTokens = async (): Promise<void> => {
  await axiosInstance.post('/auth/refresh')
}

export const getProfile = async (): Promise<Partial<User>> => {
  const response = await axiosInstance.get<Partial<User>>('/auth/profile')
  return response.data
}
