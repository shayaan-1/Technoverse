'use client'

import React, { useState } from 'react'
import { Clock, MapPin, AlertCircle, CheckCircle, User, Calendar, Filter, Eye, MoreHorizontal } from 'lucide-react'

// Mock data for department user
const mockDepartmentUser = {
  id: '123e4567-e89b-12d3-a456-426614174002',
  email: 'public_works@city.gov',
  full_name: 'Public Works Department',
  role: 'department_official',
  department: 'public_works'
}

// Mock issues data
const mockIssues = [
  {
    id: '1',
    title: 'Large Pothole on Main Street',
    description: 'Deep pothole causing vehicle damage near intersection of Main St and 1st Ave. Multiple complaints received.',
    category: 'pothole',
    status: 'assigned',
    priority: 'high',
    latitude: 40.7128,
    longitude: -74.0060,
    address: '123 Main Street, City, State',
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    reported_by: 'citizen1',
    assigned_to: null,
    assigned_department: 'public_works',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T11:00:00Z',
    reporter_name: 'John Doe'
  },
  {
    id: '2',
    title: 'Broken Street Light',
    description: 'Street light has been out for 3 days on Oak Avenue. Safety concern for pedestrians.',
    category: 'streetlight',
    status: 'pending',
    priority: 'medium',
    latitude: 40.7589,
    longitude: -73.9851,
    address: '456 Oak Avenue, City, State',
    image_url: null,
    reported_by: 'citizen2',
    assigned_to: null,
    assigned_department: 'public_works',
    created_at: '2024-01-14T15:45:00Z',
    updated_at: '2024-01-14T15:45:00Z',
    reporter_name: 'Jane Smith'
  },
  {
    id: '3',
    title: 'Traffic Signal Malfunction',
    description: 'Traffic light stuck on red for northbound traffic. Causing major delays during rush hour.',
    category: 'traffic',
    status: 'in_progress',
    priority: 'high',
    latitude: 40.7831,
    longitude: -73.9712,
    address: '789 Broadway, City, State',
    image_url: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=400',
    reported_by: 'citizen3',
    assigned_to: mockDepartmentUser.id,
    assigned_department: 'public_works',
    created_at: '2024-01-13T08:20:00Z',
    updated_at: '2024-01-15T09:15:00Z',
    reporter_name: 'Mike Johnson'
  },
  {
    id: '4',
    title: 'Road Surface Damage',
    description: 'Large cracks in asphalt creating unsafe driving conditions.',
    category: 'pothole',
    status: 'resolved',
    priority: 'medium',
    latitude: 40.7505,
    longitude: -73.9934,
    address: '321 Pine Street, City, State',
    image_url: null,
    reported_by: 'citizen4',
    assigned_to: mockDepartmentUser.id,
    assigned_department: 'public_works',
    created_at: '2024-01-10T14:30:00Z',
    updated_at: '2024-01-12T16:45:00Z',
    resolved_at: '2024-01-12T16:45:00Z',
    reporter_name: 'Sarah Wilson'
  }
]

const statusConfig = {
  pending: { 
    color: 'bg-amber-50 text-amber-700 border-amber-200', 
    icon: Clock, 
    label: 'Pending',
    dotColor: 'bg-amber-400'
  },
  assigned: { 
    color: 'bg-blue-50 text-blue-700 border-blue-200', 
    icon: User, 
    label: 'Assigned',
    dotColor: 'bg-blue-400'
  },
  in_progress: { 
    color: 'bg-orange-50 text-orange-700 border-orange-200', 
    icon: AlertCircle, 
    label: 'In Progress',
    dotColor: 'bg-orange-400'
  },
  resolved: { 
    color: 'bg-green-50 text-green-700 border-green-200', 
    icon: CheckCircle, 
    label: 'Resolved',
    dotColor: 'bg-green-400'
  }
}

const priorityConfig = {
  low: { color: 'bg-slate-50 text-slate-600 border-slate-200', label: 'Low' },
  medium: { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Medium' },
  high: { color: 'bg-red-50 text-red-700 border-red-200', label: 'High' }
}

const categoryConfig = {
  pothole: 'Pothole',
  streetlight: 'Street Light',
  sanitation: 'Sanitation',
  graffiti: 'Graffiti',
  traffic: 'Traffic',
  water: 'Water',
  general: 'General'
}

export default function DepartmentDashboard() {
  const [issues, setIssues] = useState(mockIssues)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [expandedRow, setExpandedRow] = useState(null)

  const updateIssueStatus = (issueId, newStatus) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId 
        ? { 
            ...issue, 
            status: newStatus,
            updated_at: new Date().toISOString(),
            assigned_to: newStatus === 'assigned' || newStatus === 'in_progress' ? mockDepartmentUser.id : issue.assigned_to,
            resolved_at: newStatus === 'resolved' ? new Date().toISOString() : null
          }
        : issue
    ))
  }

  const assignToSelf = (issueId) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId 
        ? { 
            ...issue, 
            assigned_to: mockDepartmentUser.id,
            status: issue.status === 'pending' ? 'assigned' : issue.status,
            updated_at: new Date().toISOString()
          }
        : issue
    ))
  }

  const filteredIssues = issues.filter(issue => {
    const statusMatch = selectedStatus === 'all' || issue.status === selectedStatus
    const priorityMatch = selectedPriority === 'all' || issue.priority === selectedPriority
    return statusMatch && priorityMatch
  })

  const stats = {
    total: issues.length,
    pending: issues.filter(i => i.status === 'pending').length,
    assigned: issues.filter(i => i.status === 'assigned').length,
    inProgress: issues.filter(i => i.status === 'in_progress').length,
    resolved: issues.filter(i => i.status === 'resolved').length
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const toggleRowExpansion = (issueId) => {
    setExpandedRow(expandedRow === issueId ? null : issueId)
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Department Dashboard</h1>
              <div className="flex items-center gap-2 text-slate-600">
                <span className="font-medium">{mockDepartmentUser.full_name}</span>
                <span className="text-slate-400">•</span>
                <span className="capitalize">{mockDepartmentUser.department} Department</span>
              </div>
            </div>
            <div className="text-right space-y-1">
              <p className="text-sm text-slate-500">Last updated</p>
              <p className="text-sm font-medium text-slate-900">{formatDate(new Date().toISOString())}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Issues</p>
                <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-amber-700">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Assigned</p>
                <p className="text-3xl font-bold text-blue-700">{stats.assigned}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 mb-1">In Progress</p>
                <p className="text-3xl font-bold text-orange-700">{stats.inProgress}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Resolved</p>
                <p className="text-3xl font-bold text-green-700">{stats.resolved}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Filters</h3>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="min-w-48">
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div className="min-w-48">
              <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Issues Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Issues</h3>
            <p className="text-sm text-slate-600">Manage and track department issues</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Issue</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Reporter</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-12"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredIssues.map((issue) => (
                  <React.Fragment key={issue.id}>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {issue.image_url && (
                            <img
                              src={issue.image_url}
                              alt="Issue"
                              className="w-12 h-12 object-cover rounded-lg border border-slate-200 mr-4"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-slate-900 truncate">{issue.title}</div>
                            <div className="text-sm text-slate-500 truncate max-w-xs">{issue.address}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium border ${statusConfig[issue.status].color}`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${statusConfig[issue.status].dotColor}`}></div>
                          {statusConfig[issue.status].label}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium border ${priorityConfig[issue.priority].color}`}>
                          {priorityConfig[issue.priority].label}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-900">{categoryConfig[issue.category]}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-slate-900">{issue.reporter_name}</div>
                          {issue.assigned_to === mockDepartmentUser.id && (
                            <div className="text-xs text-blue-600 font-medium">Assigned to you</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900">{formatDate(issue.created_at)}</div>
                        <div className="text-xs text-slate-500">{formatTime(issue.created_at)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {issue.status !== 'resolved' && (
                            <>
                              {issue.status === 'pending' && (
                                <button
                                  onClick={() => updateIssueStatus(issue.id, 'assigned')}
                                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                                >
                                  Accept
                                </button>
                              )}
                              {issue.status === 'assigned' && (
                                <button
                                  onClick={() => updateIssueStatus(issue.id, 'in_progress')}
                                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
                                >
                                  Start
                                </button>
                              )}
                              {issue.status === 'in_progress' && (
                                <button
                                  onClick={() => updateIssueStatus(issue.id, 'resolved')}
                                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                                >
                                  Resolve
                                </button>
                              )}
                              {issue.assigned_to !== mockDepartmentUser.id && issue.status !== 'resolved' && (
                                <button
                                  onClick={() => assignToSelf(issue.id)}
                                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                                >
                                  Assign
                                </button>
                              )}
                            </>
                          )}
                          {issue.status === 'resolved' && (
                            <span className="text-xs text-green-600 font-medium">
                              Resolved {formatDate(issue.resolved_at)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleRowExpansion(issue.id)}
                          className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                    {expandedRow === issue.id && (
                      <tr className="bg-slate-50">
                        <td colSpan="8" className="px-6 py-6">
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium text-slate-900 mb-2">Description</h4>
                              <p className="text-sm text-slate-600 leading-relaxed">{issue.description}</p>
                            </div>
                            {issue.address && (
                              <div>
                                <h4 className="text-sm font-medium text-slate-900 mb-2">Location</h4>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <MapPin className="w-4 h-4" />
                                  {issue.address}
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-6 text-sm text-slate-500">
                              <div>
                                <span className="font-medium">Created:</span> {formatDate(issue.created_at)} at {formatTime(issue.created_at)}
                              </div>
                              <div>
                                <span className="font-medium">Last updated:</span> {formatDate(issue.updated_at)} at {formatTime(issue.updated_at)}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {filteredIssues.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No issues found</h3>
              <p className="text-slate-600 max-w-sm mx-auto">No issues match your current filters. Try adjusting your search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}