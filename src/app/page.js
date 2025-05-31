'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/authContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Users, Zap, ArrowRight, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function HomePage() {
  const { isAuthenticated } = useAuth()

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
    'Real-Time Incident Monitoring',
    'Data-Driven Decision Making',
    'Enhanced Public Safety',
    'Efficient Resource Allocation',
    'Citizen Engagement & Transparency',
    'Disaster Management and Resilience',
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 my-20">
      {/* Hero Section */}
      <motion.div 
        className="text-center mb-28 py-16 "
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-green-700">
          Welcome to
          <br />
          Smart City Collaborative Dashboard
        </h1>

        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          "SmartSafe City Portal – Connecting Citizens, Technology, and Authorities for a Safer, Smarter Tomorrow."
        </p>

        {!isAuthenticated ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="green" className="h-14 px-8 text-lg font-semibold rounded-xl hover:scale-105 transition-all duration-200">
                Get Started 
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-semibold rounded-xl border-green-600 text-green-700 hover:bg-green-50 hover:scale-105 transition-all duration-200">
                Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <Link href="/dashboard">
            <Button size="lg" className="h-14 px-8 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold rounded-xl hover:scale-105 transition-all duration-200">
              Go to Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        )}
      </motion.div>

      {/* Features Grid */}
      <motion.div 
        className="grid md:grid-cols-3 gap-8 mb-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        {features.map((feature, index) => (
          <Card key={index} className="border-0 shadow-xl rounded-2xl bg-white hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 mx-auto bg-green-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl font-semibold text-green-800">
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
      </motion.div>

      {/* Benefits Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <Card className="mb-20 border-0 shadow-xl bg-gradient-to-br from-green-50 to-white rounded-2xl">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold text-green-800 mb-2">
              SCCD provides Everything You Need
            </CardTitle>
            <p className="text-gray-600 text-lg">
              Connect with the city management to solve your issues smartly
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* CTA Section */}
      {!isAuthenticated && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="text-center border-0 shadow-2xl bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of users engaging with their cities more intelligently.
              </p>
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 bg-white text-green-700 font-semibold rounded-xl hover:bg-green-100 hover:scale-105 transition-all duration-200">
                  Create Your Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
