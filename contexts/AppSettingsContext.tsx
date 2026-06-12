'use client';

import React from 'react';

const MUSIC_KEY = 'fifabro.musicEnabled';
const MASCOT_KEY = 'fifabro.mascotEnabled';
const MUSIC_URL = 'https://files.catbox.moe/ei5p43.mp3';

interface AppSettingsContextValue {
  musicEnabled: boolean;
  mascotEnabled: boolean;
  musicBlocked: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  setMascotEnabled: (enabled: boolean) => void;
}

const AppSettingsContext = React.createContext<AppSettingsContextValue | null>(null);

const readStoredBoolean = (key: string, fallback: boolean) => {
  if (typeof window === 'undefined') return fallback;
  const storedValue = window.localStorage.getItem(key);
  return storedValue === null ? fallback : storedValue === 'true';
};

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [musicEnabled, setMusicEnabledState] = React.useState(true);
  const [mascotEnabled, setMascotEnabledState] = React.useState(true);
  const [musicBlocked, setMusicBlocked] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    setMusicEnabledState(readStoredBoolean(MUSIC_KEY, true));
    setMascotEnabledState(readStoredBoolean(MASCOT_KEY, true));
  }, []);

  React.useEffect(() => {
    const audio = new Audio(MUSIC_URL);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0.26;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  React.useEffect(() => {
    document.documentElement.dataset.mascot = mascotEnabled ? 'on' : 'off';
  }, [mascotEnabled]);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!musicEnabled) {
      audio.pause();
      setMusicBlocked(false);
      return;
    }

    const playMusic = async () => {
      try {
        await audio.play();
        setMusicBlocked(false);
      } catch {
        setMusicBlocked(true);
      }
    };

    playMusic();
  }, [musicEnabled]);

  React.useEffect(() => {
    const resumeMusic = async () => {
      const audio = audioRef.current;
      if (!audio || !musicEnabled || !audio.paused) return;

      try {
        await audio.play();
        setMusicBlocked(false);
      } catch {
        setMusicBlocked(true);
      }
    };

    window.addEventListener('pointerdown', resumeMusic, { passive: true });
    window.addEventListener('keydown', resumeMusic);
    return () => {
      window.removeEventListener('pointerdown', resumeMusic);
      window.removeEventListener('keydown', resumeMusic);
    };
  }, [musicEnabled]);

  const setMusicEnabled = React.useCallback((enabled: boolean) => {
    setMusicEnabledState(enabled);
    window.localStorage.setItem(MUSIC_KEY, String(enabled));
  }, []);

  const setMascotEnabled = React.useCallback((enabled: boolean) => {
    setMascotEnabledState(enabled);
    window.localStorage.setItem(MASCOT_KEY, String(enabled));
  }, []);

  const value = React.useMemo(
    () => ({
      musicEnabled,
      mascotEnabled,
      musicBlocked,
      setMusicEnabled,
      setMascotEnabled,
    }),
    [musicEnabled, mascotEnabled, musicBlocked, setMusicEnabled, setMascotEnabled],
  );

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings() {
  const context = React.useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used inside AppSettingsProvider');
  }
  return context;
}
