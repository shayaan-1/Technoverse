'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/authContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Users, Zap, ArrowRight, CheckCircle } from 'lucide-react'

export default function HomePage() {
  const { isAuthenticated, user } = useAuth()

  const features = [
    {
      icon: Shield,
      title: 'Secure Authentication',
      description: 'Enterprise-grade security with Supabase and row-level security policies.',
    },
    {
      icon: Users,
      title: 'Role-Based Access',
      description: 'Granular permissions system with admin and user roles.',
    },
    {
      icon: Zap,
      title: 'Modern Stack',
      description: 'Built with Next.js 14, ShadCN UI, and the latest web technologies.',
    },
  ]

  const benefits = [
    'OAuth integration with Google & GitHub',
    'Protected routes with middleware',
    'Responsive design for all devices',
    'Real-time user state management',
    'Database-level security policies',
    'Modern, accessible UI components',
  ]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-16 py-12">
        <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-sm font-medium mb-6">
          <Zap className="w-4 h-4 mr-2" />
          Next.js 14 + Supabase + ShadCN UI
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
          Modern Authentication
          <br />
          Made Simple
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          A complete authentication system with role-based access control, 
          OAuth integration, and beautiful UI components built for modern web applications.
        </p>

        {!isAuthenticated ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg font-medium rounded-xl transform hover:scale-105 transition-all duration-200">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-medium rounded-xl border-2 hover:bg-gray-50 transform hover:scale-105 transition-all duration-200">
                Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-lg font-medium rounded-xl transform hover:scale-105 transition-all duration-200">
                Go to Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {features.map((feature, index) => (
          <Card key={index} className="auth-card border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Benefits Section */}
      <Card className="mb-16 border-0 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need
          </CardTitle>
          <p className="text-gray-600 text-lg">
            Built with modern best practices and enterprise-grade security
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA Section */}
      {!isAuthenticated && (
        <Card className="text-center border-0 shadow-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="py-12">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of developers who trust our authentication system 
              for their applications.
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="h-14 px-8 text-lg font-medium rounded-xl transform hover:scale-105 transition-all duration-200">
                Create Your Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}