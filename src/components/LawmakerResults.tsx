import { LawmakerCard } from './LawmakerCard'
import type { Lawmaker } from '@/lib/supabase'

interface LawmakerResultsProps {
  senators: Lawmaker[]
  representative: Lawmaker | null
  onSendEmail: (lawmaker: Lawmaker) => void
}

export function LawmakerResults({
  senators,
  representative,
  onSendEmail,
}: LawmakerResultsProps) {
  const hasResults = senators.length > 0 || representative !== null

  if (!hasResults) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">
          No lawmakers found. Please check your zip code and try again.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8 w-full max-w-4xl mx-auto">
      {/* Senators Section */}
      {senators.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Your Senators
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {senators.map((senator) => (
              <LawmakerCard
                key={senator.id}
                lawmaker={senator}
                onSendEmail={onSendEmail}
              />
            ))}
          </div>
        </div>
      )}

      {/* Representative Section */}
      {representative && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Your Representative
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LawmakerCard
              lawmaker={representative}
              onSendEmail={onSendEmail}
            />
          </div>
        </div>
      )}
    </div>
  )
}
