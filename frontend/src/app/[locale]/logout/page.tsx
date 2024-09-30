// app/logout/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { logout } from '@/lib/auth'

const LogoutPage = () => {
  const router = useRouter()

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await logout()
        router.push('/login')
      } catch (error: any) {
        console.error(error.message)
      }
    }

    handleLogout()
  }, [router])

  return <p>Logging out...</p>
}

export default LogoutPage
