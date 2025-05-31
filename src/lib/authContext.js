'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabaseClient } from './supabaseClient'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const getInitialSession = async () => {
    const {
      data: { session },
    } = await supabaseClient.auth.getSession()

    if (session?.user) {
      setUser(session.user)
      await fetchProfile(session.user.id)
    }
    setLoading(false)
  }

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error in fetchProfile:', error)
    }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUp = async (email, password, username, isAdmin) => {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
    })

    if (data.user && !error) {
      // Update profile with username
      await supabaseClient
      .from('profiles')
      .update({ 
        username,
        role: isAdmin ? 'admin' : 'user'
      })
      .eq('id', data.user.id)
    }

    return { data, error }
  }

  const signInWithProvider = async (provider) => {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      },
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabaseClient.auth.signOut()
    if (!error) {
      setUser(null)
      setProfile(null)
    }
    return { error }
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithProvider,
    isAdmin: profile?.role === 'admin',
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}