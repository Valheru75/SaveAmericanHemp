import { useCampaignStats } from '@/hooks/useCampaignStats'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'

const GOAL = 50000

export function CampaignStats() {
  const { totalUsers, totalEmails, loading, error } = useCampaignStats()

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">Loading campaign stats...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <p className="text-center text-red-500">
            Failed to load stats. Please try again later.
          </p>
        </CardContent>
      </Card>
    )
  }

  const totalActions = totalUsers + totalEmails
  const progressPercent = Math.min((totalActions / GOAL) * 100, 100)

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-white to-gray-50 shadow-lg">
      <CardContent className="pt-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Campaign Momentum
          </h2>
          <p className="text-gray-600">
            Join <span className="font-bold text-hempGreen">{totalUsers.toLocaleString()}</span> people
            who have sent{' '}
            <span className="font-bold text-hempGreen">{totalEmails.toLocaleString()}</span> emails
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress to Goal</span>
            <span className="font-semibold">
              {totalActions.toLocaleString()} / {GOAL.toLocaleString()}
            </span>
          </div>
          <Progress value={progressPercent} className="h-3" />
          <p className="text-xs text-gray-500 text-center">
            {progressPercent.toFixed(1)}% to 50,000 actions
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
