import Link from 'next/link'
import AuthForm from '@/components/AuthForm'
import OAuthButtons from '@/components/OAuthButtons'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <AuthForm mode="register" />
        
        {/* <div className="max-w-md mx-auto">
          <OAuthButtons />
        </div> */}

        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}