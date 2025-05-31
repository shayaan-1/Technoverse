'use client'
import React, { useState } from 'react';
import { User, Mail, Lock, Shield, Building, Users, Eye, EyeOff, Phone } from 'lucide-react';
import { registerUser } from '@/lib/authApi';
import { Button } from '@/components/ui/button';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'citizen',
    department: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const roles = [
    {
      id: 'citizen',
      title: 'Citizen',
      description: 'Report issues and access city services',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      borderColor: 'border-blue-500',
      bgLight: 'bg-blue-50',
      icon: Users
    },
    {
      id: 'department_official',
      title: 'Department Official',
      description: 'Manage department operations',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      borderColor: 'border-green-500',
      bgLight: 'bg-green-50',
      icon: Building
    },
    {
      id: 'admin',
      title: 'Admin',
      description: 'System administration and oversight',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      borderColor: 'border-purple-500',
      bgLight: 'bg-purple-50',
      icon: Shield
    }
  ];

  const departments = [
    { id: 'transport', name: 'Transportation', description: 'Roads, traffic, public transit' },
    { id: 'sanitation', name: 'Sanitation', description: 'Waste management and cleaning' },
    { id: 'health', name: 'Public Health', description: 'Health services and inspections' },
    { id: 'utilities', name: 'Utilities', description: 'Water, electricity, gas services' },
    { id: 'parks', name: 'Parks & Recreation', description: 'Parks, sports, community centers' },
    { id: 'planning', name: 'Urban Planning', description: 'City development and zoning' }
  ];

  // Client-side validation
  const validateForm = () => {
    const errors = [];

    // Name validation
    if (!formData.full_name.trim()) {
      errors.push('Full name is required');
    } else if (formData.full_name.trim().length < 2) {
      errors.push('Full name must be at least 2 characters');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.push('Email is required');
    } else if (!emailRegex.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }

    // Password validation
    if (!formData.password) {
      errors.push('Password is required');
    } else if (formData.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.push('Passwords do not match');
    }

    // Department validation for officials
    if (formData.role === 'department_official' && !formData.department) {
      errors.push('Please select a department');
    }

    // Phone validation (if provided)
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        errors.push('Please enter a valid phone number');
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Client-side validation
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        throw new Error(validationErrors[0]);
      }

      // Call the API with corrected data structure
      const result = await registerUser({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        fullName: formData.full_name.trim(),
        role: formData.role,
        department: formData.role === 'department_official' ? formData.department : null,
        phone: formData.phone.trim() || null
      });

      if (result.success) {
        setSuccess(result.message);
        // Reset form on success
        setFormData({
          full_name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'citizen',
          department: '',
          phone: ''
        });
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const selectedRole = roles.find(role => role.id === formData.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
           <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-green-700 rounded-full flex items-center justify-center mb-4">
              <Building className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Smart City</h1>
            <p className="text-gray-600">Create your account to access city services</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => updateField('full_name', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Create a password (min. 6 characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition duration-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition duration-200"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Your Role
              </label>
              <div className="space-y-3">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = formData.role === role.id;
                  
                  return (
                    <div
                      key={role.id}
                      onClick={() => updateField('role', role.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? `${role.borderColor} ${role.bgLight}` 
                          : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${role.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{role.title}</h3>
                          <p className="text-sm text-gray-500">{role.description}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          isSelected ? `${role.borderColor} ${role.color}` : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Department Selection for Department Officials */}
            {formData.role === 'department_official' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Department *
                </label>
                <div className="space-y-2">
                  {departments.map((dept) => (
                    <div
                      key={dept.id}
                      onClick={() => updateField('department', dept.id)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        formData.department === dept.id 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{dept.name}</div>
                          <div className="text-sm text-gray-500">{dept.description}</div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ml-3 ${
                          formData.department === dept.id ? 'border-green-500 bg-green-500' : 'border-gray-300'
                        }`}>
                          {formData.department === dept.id && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant='green'
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${selectedRole.color} ${selectedRole.hoverColor} ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transform hover:scale-[1.02]'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="text-green-600 hover:text-green-700 font-medium hover:underline transition-colors">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;