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
        <p className="text-gray-600 mb-2">
          No lawmakers found for this location.
        </p>
        <p className="text-sm text-gray-500">
          Please verify your zip code is correct and represents a valid U.S. address.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8 w-full max-w-4xl mx-auto">
      {/* Senators Section */}
      {senators.length > 0 && (
        <section aria-labelledby="senators-heading">
          <h2 id="senators-heading" className="text-2xl font-bold mb-4 text-gray-800">
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
        </section>
      )}

      {/* Representative Section */}
      {representative && (
        <section aria-labelledby="representative-heading">
          <h2 id="representative-heading" className="text-2xl font-bold mb-4 text-gray-800">
            Your Representative
          </h2>
          <div className="max-w-md">
            <LawmakerCard
              lawmaker={representative}
              onSendEmail={onSendEmail}
            />
          </div>
        </section>
      )}
    </div>
  )
}
