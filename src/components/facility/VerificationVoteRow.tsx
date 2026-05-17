import { Check, X } from 'lucide-react'
import type { VerificationEntry } from '../../types'

interface Props {
  facilityId: string
  dimension: VerificationEntry['dimension']
  disabilityType: VerificationEntry['disabilityType']
  confirms: number
  denies: number
  userVote: VerificationEntry['vote'] | null
  onVote: (vote: VerificationEntry['vote']) => void
}

export function VerificationVoteRow({
  confirms,
  denies,
  userVote,
  onVote,
}: Props) {
  const total = confirms + denies

  return (
    <div className="mt-1 flex items-center gap-2 pl-[calc(0.75rem+1px)]">
      <button
        type="button"
        aria-pressed={userVote === 'confirm'}
        onClick={() => onVote('confirm')}
        className={[
          'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
          userVote === 'confirm'
            ? 'bg-success/20 text-success ring-1 ring-success/40 hc:bg-black hc:text-white'
            : 'bg-muted text-foreground/70 hover:bg-success/10 hover:text-success hc:text-black',
        ].join(' ')}
      >
        <Check aria-hidden size={11} strokeWidth={2.5} />
        Doğru
      </button>

      <button
        type="button"
        aria-pressed={userVote === 'deny'}
        onClick={() => onVote('deny')}
        className={[
          'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
          userVote === 'deny'
            ? 'bg-destructive/20 text-destructive ring-1 ring-destructive/40 hc:bg-black hc:text-white'
            : 'bg-muted text-foreground/70 hover:bg-destructive/10 hover:text-destructive hc:text-black',
        ].join(' ')}
      >
        <X aria-hidden size={11} strokeWidth={2.5} />
        Değil
      </button>

      {total > 0 && (
        <span className="ml-auto text-[10px] text-muted-foreground tabular-nums hc:text-black">
          <span className="text-success font-medium">{confirms}</span>
          <span aria-hidden> · </span>
          <span className="sr-only">doğrulama, </span>
          <span className="text-destructive font-medium">{denies}</span>
          <span className="sr-only"> itiraz</span>
        </span>
      )}
    </div>
  )
}
