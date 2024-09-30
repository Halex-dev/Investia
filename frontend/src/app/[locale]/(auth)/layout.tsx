'use client'

import React, { useState, ReactNode, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Home,
  Settings,
  LogOut,
  Menu,
  Bell,
  User,
  LucideIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  BadgeEuro,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Toaster } from '@/components/ui/toaster'

interface SidebarLinkProps {
  href: string
  icon: LucideIcon
  children: ReactNode
  active: boolean
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
  href,
  icon: Icon,
  children,
  active,
}) => (
  <Link
    href={href}
    className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      active
        ? 'bg-primary/10 text-primary'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    <Icon className="h-5 w-5" />
    <span>{children}</span>
  </Link>
)

interface DashboardLayoutProps {
  children: ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true)
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 text-gray-900">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 z-50 flex flex-col bg-white transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'w-64' : 'w-16'
          } ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : ''} shadow-md`}
        >
          <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
            {sidebarOpen && (
              <span className="text-2xl font-semibold text-primary">
                FinDash
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700"
              onClick={toggleSidebar}
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-6 w-6" />
              ) : (
                <ChevronRight className="h-6 w-6" />
              )}
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            <SidebarLink
              href="/dashboard"
              icon={Home}
              active={pathname === '/dashboard'}
            >
              {sidebarOpen && 'Dashboard'}
            </SidebarLink>
            <SidebarLink
              href="/transactions"
              icon={BadgeEuro}
              active={pathname === '/transactions'}
            >
              {sidebarOpen && 'Transactions'}
            </SidebarLink>
            <SidebarLink
              href="/categories"
              icon={Filter}
              active={pathname === '/categories'}
            >
              {sidebarOpen && 'Categories'}
            </SidebarLink>
            <SidebarLink
              href="/settings"
              icon={Settings}
              active={pathname === '/settings'}
            >
              {sidebarOpen && 'Settings'}
            </SidebarLink>
          </nav>
        </aside>

        {/* Main content */}
        <div
          className={`flex flex-1 flex-col transition-all duration-300 ease-in-out ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'}`}
        >
          {/* Top bar */}
          <header className="flex h-16 items-center justify-between bg-white px-4 shadow-sm">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 md:hidden"
                onClick={toggleSidebar}
              >
                <Menu className="h-6 w-6" />
              </Button>
            )}
            <div className="flex-grow" />
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-700"
              >
                <Bell className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                className="flex items-center space-x-2 text-gray-500 hover:text-gray-700"
              >
                <User className="h-5 w-5" />
                <span className="hidden sm:inline">{user?.username}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="container mx-auto">{children}</div>
          </main>
        </div>
      </div>
      <Toaster />
    </ProtectedRoute>
  )
}

export default DashboardLayout
