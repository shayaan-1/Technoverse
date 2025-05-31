'use client'

import { useAuth } from '@/lib/authContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Shield, Calendar, Activity, Settings, Bell } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, profile, isAdmin } = useAuth()

  const stats = [
    {
      title: 'Account Status',
      value: 'Active',
      icon: User,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Role',
      value: profile?.role || 'user',
      icon: Shield,
      color: isAdmin ? 'text-amber-600' : 'text-blue-600',
      bgColor: isAdmin ? 'bg-amber-50' : 'bg-blue-50',
    },
    {
      title: 'Member Since',
      value: new Date(user?.created_at).toLocaleDateString(),
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Login Method',
      value: user?.app_metadata?.provider || 'email',
      icon: Activity,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ]

  const quickActions = [
    {
      title: 'Profile Settings',
      description: 'Update your personal information',
      icon: Settings,
      href: '#',
      disabled: true,
    },
    {
      title: 'Notifications',
      description: 'Manage your notification preferences',
      icon: Bell,
      href: '#',
      disabled: true,
    },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome back, {profile?.username || user?.email?.split('@')[0]}!
        </h1>
        <p className="text-gray-600 text-lg">
          Here's what's happening with your account today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="auth-card border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 capitalize">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-900">
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900 font-medium">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Username</label>
                  <p className="text-gray-900 font-medium">{profile?.username || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Role</label>
                  <p className={`font-medium capitalize ${isAdmin ? 'text-amber-600' : 'text-blue-600'}`}>
                    {profile?.role || 'user'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Account Created</label>
                  <p className="text-gray-900 font-medium">
                    {new Date(user?.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quickActions.map((action, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-white rounded-lg">
                      <action.icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="mt-2 p-0 h-auto font-medium text-blue-600 cursor-pointer"
                        disabled={action.disabled}
                      >
                        {action.disabled ? 'Coming Soon' : 'Configure'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {isAdmin && (
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Shield className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Admin Panel</h3>
                      <p className="text-sm text-gray-600 mt-1">Access administrative features</p>
                      <Link href="/admin">
                        <Button 
                          size="sm" 
                          className="mt-2 bg-amber-600 hover:bg-amber-700"
                        >
                          Open Admin Panel
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}