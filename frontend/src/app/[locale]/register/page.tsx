'use client'

import { RegisterForm } from '@/components/ui-mine/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100">
      <div className="container flex min-h-screen w-full flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Create an account
            </h1>
            <p className="text-lg text-gray-600">
              Start your journey to financial freedom
            </p>
          </div>
          <RegisterForm />
          <p className="mt-10 text-center text-sm text-gray-500">
            By signing up, you agree to our{' '}
            <a
              href="#"
              className="font-semibold text-green-600 hover:text-green-800"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="#"
              className="font-semibold text-green-600 hover:text-green-800"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
