// lib/userSession.js
import Cookies from 'js-cookie'

// Get user session from cookies
export const getUserSession = () => {
  try {
    const sessionCookie = Cookies.get('user_session')
    if (!sessionCookie) return null
    
    return JSON.parse(sessionCookie)
  } catch (error) {
    console.error('Error parsing user session:', error)
    return null
  }
}

// Get specific user data from cookies
export const getUserData = () => {
  return {
    id: Cookies.get('user_id'),
    email: Cookies.get('user_email'),
    name: Cookies.get('user_name'),
    role: Cookies.get('user_role'),
    session: getUserSession()
  }
}

// Check if user is logged in
export const isLoggedIn = () => {
  const session = getUserSession()
  return !!session?.id
}

// Get user role
export const getUserRole = () => {
  return Cookies.get('user_role') || 'citizen'
}

// Check if user has specific role
export const hasRole = (role) => {
  const userRole = getUserRole()
  return userRole === role
}

// Check if user is admin
export const isAdmin = () => {
  return hasRole('admin')
}

// Check if user is department official
export const isDepartmentOfficial = () => {
  return hasRole('department_official')
}

// Update user session (when profile is updated)
export const updateUserSession = (updates) => {
  try {
    const currentSession = getUserSession()
    if (!currentSession) return false

    const updatedSession = {
      ...currentSession,
      ...updates,
      lastUpdated: new Date().toISOString()
    }

    const cookieOptions = {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    }

    Cookies.set('user_session', JSON.stringify(updatedSession), cookieOptions)
    
    // Update individual cookies if provided
    if (updates.fullName) {
      Cookies.set('user_name', updates.fullName, cookieOptions)
    }
    if (updates.role) {
      Cookies.set('user_role', updates.role, cookieOptions)
    }

    return true
  } catch (error) {
    console.error('Error updating user session:', error)
    return false
  }
}

// Clear user session (logout)
export const clearUserSession = () => {
  try {
    // Remove all user-related cookies
    const cookiesToRemove = [
      'user_session',
      'user_id',
      'user_email',
      'user_name',
      'user_role'
    ]

    cookiesToRemove.forEach(cookie => {
      Cookies.remove(cookie)
    })

    console.log('User session cleared')
    return true
  } catch (error) {
    console.error('Error clearing user session:', error)
    return false
  }
}

// Get user's full name
export const getUserName = () => {
  const session = getUserSession()
  return session?.fullName || Cookies.get('user_name') || 'User'
}

// Get user's department (for department officials)
export const getUserDepartment = () => {
  const session = getUserSession()
  return session?.department
}

// Check if session is expired (optional - based on lastLogin)
export const isSessionExpired = (maxAgeHours = 24 * 7) => { // Default 7 days
  const session = getUserSession()
  if (!session?.lastLogin) return true

  const lastLogin = new Date(session.lastLogin)
  const now = new Date()
  const hoursSinceLogin = (now - lastLogin) / (1000 * 60 * 60)

  return hoursSinceLogin > maxAgeHours
}

// Refresh session timestamp
export const refreshSession = () => {
  const session = getUserSession()
  if (!session) return false

  return updateUserSession({
    lastLogin: new Date().toISOString()
  })
}