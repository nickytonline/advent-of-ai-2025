import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface SettingsContextType {
  soundEnabled: boolean
  toggleSound: () => void
  setSoundEnabled: (enabled: boolean) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

const STORAGE_KEY = 'homecoming-board-settings'

interface SettingsProviderProps {
  children: ReactNode
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  // Load initial state from localStorage
  const [soundEnabled, setSoundEnabledState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const settings = JSON.parse(stored)
        return settings.soundEnabled ?? true
      }
    } catch (e) {
      console.error('Failed to load settings:', e)
    }
    return true // Default to enabled
  })

  // Save to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ soundEnabled }))
    } catch (e) {
      console.error('Failed to save settings:', e)
    }
  }, [soundEnabled])

  const toggleSound = () => {
    setSoundEnabledState(prev => !prev)
  }

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled)
  }

  return (
    <SettingsContext.Provider value={{ soundEnabled, toggleSound, setSoundEnabled }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
