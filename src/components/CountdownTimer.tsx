import { useCountdown } from '../hooks/useCountdown'

const BAN_EFFECTIVE_DATE = new Date('2026-11-12T00:00:00-05:00') // Nov 12, 2026, EST

export function CountdownTimer() {
  const { days, hours, minutes, seconds, total } = useCountdown(BAN_EFFECTIVE_DATE)

  // Color-coded urgency
  const getColorClass = () => {
    if (days > 300) return 'text-hempGreen'
    if (days > 100) return 'text-urgentOrange'
    return 'text-warningRed'
  }

  if (total <= 0) {
    return (
      <div className="text-center">
        <p className="text-2xl font-bold text-warningRed">The hemp ban is now in effect.</p>
      </div>
    )
  }

  return (
    <div className="text-center">
      <h2 className="text-lg md:text-xl font-semibold text-gray-700 mb-4">
        THE HEMP BAN TAKES EFFECT IN:
      </h2>
      <div className={`flex justify-center gap-4 md:gap-8 font-mono text-4xl md:text-6xl font-bold ${getColorClass()}`}>
        <div className="flex flex-col items-center">
          <span>{String(days).padStart(3, '0')}</span>
          <span className="text-sm md:text-base font-normal text-gray-600 mt-2">DAYS</span>
        </div>
        <span className="self-start">:</span>
        <div className="flex flex-col items-center">
          <span>{String(hours).padStart(2, '0')}</span>
          <span className="text-sm md:text-base font-normal text-gray-600 mt-2">HRS</span>
        </div>
        <span className="self-start">:</span>
        <div className="flex flex-col items-center">
          <span>{String(minutes).padStart(2, '0')}</span>
          <span className="text-sm md:text-base font-normal text-gray-600 mt-2">MIN</span>
        </div>
        <span className="self-start">:</span>
        <div className="flex flex-col items-center">
          <span>{String(seconds).padStart(2, '0')}</span>
          <span className="text-sm md:text-base font-normal text-gray-600 mt-2">SEC</span>
        </div>
      </div>
    </div>
  )
}
