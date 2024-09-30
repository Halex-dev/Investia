import axios from 'axios'

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
})

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      if (!window.location.href.includes('/login')) {
        try {
          await axios.post('/auth/refresh', {}, { withCredentials: true })
          return axiosInstance(originalRequest)
        } catch (refreshError) {
          console.info('Token refresh failed:', refreshError)
          // Refresh token is invalid or expired
          // Redirect to login page or show a modal to re-authenticate
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      }
    }

    return Promise.reject(error)
  }
)
