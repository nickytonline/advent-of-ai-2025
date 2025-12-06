import { useSettings } from '../contexts/SettingsContext'

export function SettingsButton() {
  const { soundEnabled, toggleSound } = useSettings()

  return (
    <button
      onClick={toggleSound}
      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur-sm border border-slate-600/50 rounded-lg transition-colors text-white"
      title={soundEnabled ? 'Disable sounds' : 'Enable sounds'}
    >
      <span className="text-xl">
        {soundEnabled ? '🔊' : '🔇'}
      </span>
      <span className="text-sm font-medium">
        {soundEnabled ? 'Sound On' : 'Sound Off'}
      </span>
    </button>
  )
}
