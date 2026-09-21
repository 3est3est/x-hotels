import { useLang, type Lang } from '../lib/i18n'
import { cn } from '../lib/utils'

/** EN/TH switch. Persists to localStorage; sits left in the header by the brand. */
export function LanguageToggle() {
  const { lang, setLang } = useLang()
  const options: { value: Lang; label: string }[] = [
    { value: 'en', label: 'EN' },
    { value: 'th', label: 'ไทย' },
  ]
  return (
    <div
      className="flex items-center rounded-full border border-hairline bg-paper p-0.5"
      role="group"
      aria-label="Language / ภาษา"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setLang(option.value)}
          aria-pressed={lang === option.value}
          className={cn(
            'rounded-full px-2.5 py-1 text-xs font-medium transition',
            lang === option.value ? 'bg-ink text-white' : 'text-faint hover:text-ink',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
