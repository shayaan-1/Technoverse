'use client'
import React, { useState, useEffect } from 'react'
import { Search, Filter, Eye, Calendar, MapPin, AlertCircle, CheckCircle, Clock, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

// Status color mapping
const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'open': return 'bg-green-100 text-green-800 border-green-200'
    case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'resolved': return 'bg-green-100 text-green-800 border-green-200'
    case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

// Priority color mapping
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800 border-red-200'
    case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'low': return 'bg-green-100 text-green-800 border-green-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

// Status icon mapping
const getStatusIcon = (status) => {
  switch (status) {
    case 'pending': return <Clock className="w-4 h-4" />
    case 'open': return <AlertCircle className="w-4 h-4" />
    case 'in_progress': return <Clock className="w-4 h-4" />
    case 'resolved': return <CheckCircle className="w-4 h-4" />
    case 'closed': return <XCircle className="w-4 h-4" />
    default: return <AlertCircle className="w-4 h-4" />
  }
}

export default function IssuesDashboard() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [selectedIssue, setSelectedIssue] = useState(null)
  
  const router = useRouter(null)

  // Filter options
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ]

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'pothole', label: 'Pothole' },
    { value: 'streetlight', label: 'Street Light' },
    { value: 'sanitation', label: 'Sanitation' },
    { value: 'graffiti', label: 'Graffiti' },
    { value: 'traffic', label: 'Traffic' },
    { value: 'water', label: 'Water' },
    { value: 'general', label: 'General' }
  ]

  // Fetch issues
  const fetchIssues = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })
      
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (categoryFilter !== 'all') params.append('category', categoryFilter)

      const response = await fetch(`/api/citizenDashboard?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch issues')
      }

      setIssues(data.issues)
      setPagination(data.pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIssues()
  }, [currentPage, statusFilter, categoryFilter])

  const filteredIssues = issues.filter(issue =>
    issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination?.totalPages) {
      setCurrentPage(newPage)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          Error: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-green-900 mb-2">My Issues</h1>
        <p className="text-green-700">Track and manage your submitted issues</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-green-200 shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Results count and button */}
          <div className="flex flex-col items-center justify-between gap-4">
            <div className="flex items-center text-sm text-green-700">
              <Filter className="w-4 h-4 mr-2" />
              {pagination?.totalItems || 0} issues found
            </div>
            <Button variant='green' onClick={() => {router.push('/createIssue')}}>
              Address An Issue
            </Button>
            <Button variant='green' onClick={() => {router.push('/chat')}}>
              Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white rounded-lg border border-green-200 shadow-sm overflow-hidden">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-green-300" />
            <p className="mt-4 text-green-700">No issues found matching your criteria.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-green-200">
            <thead className="bg-green-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider">Issue Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider">Created At</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-green-200">
              {filteredIssues.map(issue => (
                <tr key={issue._id} className="hover:bg-green-50">
                  <td className="px-4 py-2 whitespace-nowrap max-w-xs truncate">{issue.title}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{issue.category}</td>
                  <td className="px-4 py-2 whitespace-nowrap flex items-center gap-1 text-green-700">
                    <MapPin className="w-4 h-4" /> {issue.location || 'N/A'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded border ${getStatusColor(issue.status)}`}>
                      {getStatusIcon(issue.status)}&nbsp;{issue.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded border ${getPriorityColor(issue.priority)}`}>
                      {issue.priority.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-green-700">{formatDate(issue.createdAt)}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-600 hover:bg-green-100"
                      onClick={() => setSelectedIssue(issue)}
                    >
                      <Eye className="w-4 h-4" />
                      <span className="sr-only">View Details</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <nav
          className="mt-6 flex items-center justify-between"
          aria-label="Pagination"
        >
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="text-green-600 border-green-600 hover:bg-green-100"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </Button>
          <span className="text-green-700 font-medium">
            Page {currentPage} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === pagination.totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="text-green-600 border-green-600 hover:bg-green-100"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </nav>
      )}

      {/* Selected Issue Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-green-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button
              onClick={() => setSelectedIssue(null)}
              className="absolute top-3 right-3 text-green-600 hover:text-green-900"
              aria-label="Close details"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold text-green-900 mb-2">{selectedIssue.title}</h2>
            <p className="text-green-700 mb-4">{selectedIssue.description}</p>
            <ul className="text-green-700 space-y-2 text-sm">
              <li><strong>Category:</strong> {selectedIssue.category}</li>
              <li><strong>Location:</strong> {selectedIssue.location}</li>
              <li><strong>Status:</strong> {selectedIssue.status.replace('_', ' ')}</li>
              <li><strong>Priority:</strong> {selectedIssue.priority}</li>
              <li><strong>Created At:</strong> {formatDate(selectedIssue.createdAt)}</li>
              {selectedIssue.updatedAt && <li><strong>Updated At:</strong> {formatDate(selectedIssue.updatedAt)}</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
