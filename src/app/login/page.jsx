'use client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import AuthForm from '@/components/AuthForm'
import OAuthButtons from '@/components/OAuthButtons'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') 
  
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        {message && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-center">
            {message}
          </div>
        )}
        
        <AuthForm mode="login" />
        
        <div className="max-w-md mx-auto">
          <OAuthButtons />
        </div>

        <div className="text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link 
              href="/register" 
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}