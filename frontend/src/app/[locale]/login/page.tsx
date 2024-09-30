'use client'

import { LoginForm } from '@/components/ui-mine/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100">
      <div className="container flex min-h-screen w-full flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Welcome back
            </h1>
            <p className="text-lg text-gray-600">
              Enter your credentials to access your account
            </p>
          </div>
          <LoginForm />
          <p className="mt-10 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <a
              href="/register"
              className="font-semibold text-blue-600 hover:text-blue-800"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
