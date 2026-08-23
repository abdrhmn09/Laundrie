interface PasswordStrengthMeterProps {
  password: string
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  if (!password) return null

  const calculateScore = (pwd: string): number => {
    let score = 0
    if (pwd.length >= 8) score += 1
    if (pwd.length >= 12) score += 1
    if (/[A-Z]/.test(pwd)) score += 1
    if (/[0-9]/.test(pwd)) score += 1
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1
    return score
  }

  const score = calculateScore(password)

  const getConfig = (s: number) => {
    if (s <= 1) return { label: 'Sangat Lemah', color: 'bg-error', width: 'w-1/5' }
    if (s === 2) return { label: 'Lemah', color: 'bg-amber-500', width: 'w-2/5' }
    if (s === 3) return { label: 'Sedang', color: 'bg-yellow-500', width: 'w-3/5' }
    if (s === 4) return { label: 'Kuat', color: 'bg-teal-500', width: 'w-4/5' }
    return { label: 'Sangat Kuat', color: 'bg-status-success', width: 'w-full' }
  }

  const cfg = getConfig(score)

  return (
    <div className="mt-2 space-y-1">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-variant">
        <div className={`h-full transition-all duration-300 ${cfg.color} ${cfg.width}`} />
      </div>
      <div className="flex justify-between text-[11px] font-semibold text-on-surface-variant">
        <span>Kekuatan Password:</span>
        <span className={score <= 2 ? 'text-error' : score <= 3 ? 'text-amber-600' : 'text-status-success'}>
          {cfg.label}
        </span>
      </div>
    </div>
  )
}
