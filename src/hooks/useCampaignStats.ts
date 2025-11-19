import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface CampaignStats {
  totalUsers: number
  totalEmails: number
  loading: boolean
  error: Error | null
}

export function useCampaignStats(): CampaignStats {
  const [stats, setStats] = useState<CampaignStats>({
    totalUsers: 0,
    totalEmails: 0,
    loading: true,
    error: null,
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data, error } = await supabase
          .from('campaign_stats')
          .select('*')
          .single()

        if (error) throw error

        setStats({
          totalUsers: data.total_users || 0,
          totalEmails: data.total_emails || 0,
          loading: false,
          error: null,
        })
      } catch (err) {
        setStats(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err : new Error('Failed to fetch stats'),
        }))
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return stats
}
