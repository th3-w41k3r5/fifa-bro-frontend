'use client';

import React from 'react';
import { Eye, EyeOff, Settings, Volume2, VolumeX, X } from 'lucide-react';
import { useAppSettings } from '@/contexts/AppSettingsContext';

interface SettingsPanelProps {
  className?: string;
  onClose?: () => void;
}

function SettingToggle({
  checked,
  onChange,
  label,
  description,
  icon,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="group flex w-full items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.035] px-4 py-4 text-left transition duration-300 hover:border-accent/25 hover:bg-white/[0.06] active:scale-[0.99]"
      aria-pressed={checked}
    >
      <span
        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border transition duration-300 ${
          checked
            ? 'border-accent/35 bg-accent/15 text-accent shadow-[0_0_24px_rgba(0,183,255,0.16)]'
            : 'border-white/[0.08] bg-black/20 text-text-secondary'
        }`}
      >
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-black uppercase tracking-[0.08em] text-text-primary">{label}</span>
        <span className="mt-1 block text-xs font-medium leading-relaxed text-text-secondary/75">{description}</span>
      </span>

      <span
        className={`relative h-7 w-12 flex-shrink-0 rounded-full border transition duration-300 ${
          checked ? 'border-accent/40 bg-accent/25' : 'border-white/[0.10] bg-white/[0.04]'
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full transition duration-300 ${
            checked ? 'left-6 bg-accent shadow-[0_0_14px_rgba(0,183,255,0.45)]' : 'left-1 bg-text-secondary'
          }`}
        />
      </span>
    </button>
  );
}

export function SettingsPanel({ className = '', onClose }: SettingsPanelProps) {
  const { musicEnabled, mascotEnabled, musicBlocked, setMusicEnabled, setMascotEnabled } = useAppSettings();

  return (
    <div className={`relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-[rgba(8,11,16,0.94)] shadow-[0_22px_60px_rgba(0,0,0,0.48)] backdrop-blur-[32px] ${className}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(0,183,255,0.10),transparent_42%),linear-gradient(145deg,rgba(255,255,255,0.04),transparent_48%)]" />
      <div className="relative z-10 p-5">
        <div className="mb-5 border-b border-white/[0.06] pb-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-accent/25 bg-accent/[0.12] text-accent">
                <Settings size={18} />
              </span>
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.16em] text-text-primary">Settings</h3>
                <p className="mt-1 text-xs font-medium text-text-secondary/70">
                  Audio and display preferences
                </p>
              </div>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-text-secondary transition duration-300 hover:border-accent/25 hover:bg-white/[0.08] hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/35"
                aria-label="Close settings"
              >
                <X size={18} />
              </button>
            )}
          </div>
          {musicBlocked && musicEnabled && (
            <p className="mt-3 rounded-2xl border border-accent/15 bg-accent/[0.08] px-3 py-2 text-xs font-semibold text-accent/90">
              Tap anywhere once if your browser paused autoplay.
            </p>
          )}
        </div>

        <div className="space-y-3">
          <SettingToggle
            checked={musicEnabled}
            onChange={setMusicEnabled}
            label="Music"
            description={musicEnabled ? 'Tournament theme is playing' : 'Tournament theme is muted'}
            icon={musicEnabled ? <Volume2 size={19} /> : <VolumeX size={19} />}
          />
          <SettingToggle
            checked={mascotEnabled}
            onChange={setMascotEnabled}
            label="Mascot"
            description={mascotEnabled ? 'Floating mascot is visible' : 'Floating mascot is hidden'}
            icon={mascotEnabled ? <Eye size={19} /> : <EyeOff size={19} />}
          />
        </div>
      </div>
    </div>
  );
}
