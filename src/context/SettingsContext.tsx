'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getUserSettings, updateUserSettings } from '@/lib/firestore';
import { useTheme } from './ThemeContext';
import type { UserSettings } from '@/types';

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (data: Partial<UserSettings>) => Promise<void>;
  loading: boolean;
}

const defaultSettings: UserSettings = { unit: 'kg', theme: 'system' };

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: async () => {},
  loading: true,
});

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { setTheme } = useTheme();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSettings(defaultSettings);
      setLoading(false);
      return;
    }

    getUserSettings(user.uid)
      .then((s) => {
        setSettings(s);
        setTheme(s.theme);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, setTheme]);

  const update = useCallback(async (data: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...data };
    setSettings(newSettings);

    if (data.theme) {
      setTheme(data.theme);
    }

    if (user) {
      await updateUserSettings(user.uid, data);
    }
  }, [settings, user, setTheme]);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings: update, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}
