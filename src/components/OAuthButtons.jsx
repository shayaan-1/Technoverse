'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/authContext'
import { Button } from '@/components/ui/button'
import { Github, Chrome, Loader2 } from 'lucide-react'

export default function OAuthButtons() {
  const [loading, setLoading] = useState(null)
  const { signInWithProvider } = useAuth()

  const handleOAuthSignIn = async (provider) => {
    setLoading(provider)
    try {
      const { error } = await signInWithProvider(provider)
      if (error) {
        console.error(`${provider} sign in error:`, error)
      }
    } catch (err) {
      console.error(`${provider} sign in error:`, err)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button
          variant="outline"
          onClick={() => handleOAuthSignIn('google')}
          disabled={loading === 'google'}
          className="h-12 border-gray-300 hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100"
        >
          {loading === 'google' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Chrome className="w-4 h-4 mr-2 text-red-500" />
          )}
          Google
        </Button>

        <Button
          variant="outline"
          onClick={() => handleOAuthSignIn('github')}
          disabled={loading === 'github'}
          className="h-12 border-gray-300 hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100"
        >
          {loading === 'github' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Github className="w-4 h-4 mr-2" />
          )}
          GitHub
        </Button>
      </div>
    </div>
  )
}