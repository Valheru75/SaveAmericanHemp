import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Lawmaker } from '@/lib/supabase'

interface LawmakerCardProps {
  lawmaker: Lawmaker
  onSendEmail: (lawmaker: Lawmaker) => void
}

export function LawmakerCard({ lawmaker, onSendEmail }: LawmakerCardProps) {
  const partyColor =
    lawmaker.party === 'Democratic'
      ? 'bg-blue-500'
      : lawmaker.party === 'Republican'
      ? 'bg-red-500'
      : 'bg-gray-500'

  const chamberLabel = lawmaker.chamber === 'senate' ? 'Senator' : 'Representative'

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-4 pb-4">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          {lawmaker.photo_url ? (
            <img
              src={lawmaker.photo_url}
              alt={lawmaker.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl font-bold">
              {lawmaker.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold truncate">{lawmaker.name}</h3>
          <p className="text-sm text-gray-600">
            {chamberLabel} • {lawmaker.state}
          </p>
          {lawmaker.party && (
            <Badge className={`${partyColor} text-white mt-1`}>
              {lawmaker.party}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {lawmaker.email && (
          <div className="text-sm">
            <span className="font-semibold">Email:</span>{' '}
            <a href={`mailto:${lawmaker.email}`} className="text-blue-600 hover:underline">
              {lawmaker.email}
            </a>
          </div>
        )}
        {lawmaker.phone && (
          <div className="text-sm">
            <span className="font-semibold">Phone:</span>{' '}
            <a href={`tel:${lawmaker.phone}`} className="text-blue-600 hover:underline">
              {lawmaker.phone}
            </a>
          </div>
        )}
        {lawmaker.contact_form_url && (
          <div className="text-sm">
            <a
              href={lawmaker.contact_form_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Official Website →
            </a>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          onClick={() => onSendEmail(lawmaker)}
          className="w-full bg-hempGreen hover:bg-hempGreen/90 text-white font-semibold"
        >
          Send Email to {lawmaker.name.split(' ')[0]}
        </Button>
      </CardFooter>
    </Card>
  )
}
