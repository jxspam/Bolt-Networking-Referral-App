import { useState, useEffect } from 'react'
import { supabase, Lead } from '../lib/supabase'

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          campaigns (
            name,
            businesses (
              business_name
            )
          ),
          profiles (
            full_name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        setLeads(data || [])
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createLead = async (leadData: Partial<Lead>) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert(leadData)
        .select()
        .single()

      if (error) {
        throw error
      }

      setLeads(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setLeads(prev => 
        prev.map(lead => 
          lead.id === id ? data : lead
        )
      )
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  return {
    leads,
    loading,
    error,
    fetchLeads,
    createLead,
    updateLead,
  }
}