'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Check, Loader2 } from 'lucide-react';
import apiFetch from '../../../lib/api';
import type { SiteConfig, SocialLink } from '@dikshant/types';

const AUTOSAVE_INTERVAL_OPTIONS = [
  { value: 30000, label: '30 seconds' },
  { value: 60000, label: '1 minute' },
  { value: 120000, label: '2 minutes' },
  { value: 300000, label: '5 minutes' },
];

const SOCIAL_PRESETS: SocialLink[] = [
  { platform: 'instagram', label: 'Instagram', url: 'https://instagram.com/' },
  { platform: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/in/' },
  { platform: 'github', label: 'GitHub', url: 'https://github.com/' },
  { platform: 'twitter', label: 'Twitter / X', url: 'https://x.com/' },
  { platform: 'email', label: 'Email', url: 'mailto:' },
  { platform: 'phone', label: 'Phone', url: 'tel:' },
];

const SAVE_DELAY_MS = 600;

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface SocialRow {
  id: string;
  platform: string;
  label: string;
  url: string;
}

function toSocialRow(link: SocialLink): SocialRow {
  return {
    id: crypto.randomUUID(),
    platform: link.platform ?? '',
    label: link.label ?? '',
    url: link.url ?? '',
  };
}

function isComplete(row: SocialRow) {
  return row.platform.trim() !== '' && row.label.trim() !== '' && row.url.trim() !== '';
}

function SaveStatus({ state, idle, onRetry }: { state: SaveState; idle?: string; onRetry?: () => void }) {
  if (state === 'saving') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Saving…
      </span>
    );
  }
  if (state === 'saved') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
        <Check className="h-3.5 w-3.5" />
        Saved
      </span>
    );
  }
  if (state === 'error') {
    return (
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-destructive hover:underline"
      >
        <AlertCircle className="h-3.5 w-3.5" />
        Save failed — click to retry
      </button>
    );
  }
  if (idle) return <span className="text-xs text-muted-foreground">{idle}</span>;
  return null;
}

export default function SettingsPage() {
  const [error, setError] = useState('');
  const [status, setStatus] = useState<Record<string, SaveState>>({});
  const [featuredCountStr, setFeaturedCountStr] = useState('1');
  const [form, setForm] = useState<{
    homepageFeaturedCount: number;
    autosaveEnabled: boolean;
    autosaveIntervalMs: number;
  } | null>(null);
  const [socialRows, setSocialRows] = useState<SocialRow[]>([]);

  const { data: settingsData, isLoading } = useQuery<SiteConfig>({
    queryKey: ['settings'],
    queryFn: () => apiFetch('/settings'),
    staleTime: 30_000,
  });

  // Hydrate local state from query data
  useEffect(() => {
    if (settingsData) {
      setForm({
        homepageFeaturedCount: settingsData.homepageFeaturedCount,
        autosaveEnabled: settingsData.autosaveEnabled,
        autosaveIntervalMs: settingsData.autosaveIntervalMs,
      });
      setFeaturedCountStr(String(settingsData.homepageFeaturedCount));
      setSocialRows((settingsData.socialLinks ?? []).map(toSocialRow));
    }
  }, [settingsData]);

  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const seq = useRef<Record<string, number>>({});
  const formRef = useRef(form);
  formRef.current = form;
  const lastSentSocial = useRef('');

  const setStatusFor = (key: string, state: SaveState) => {
    setStatus((prev) => ({ ...prev, [key]: state }));
  };

  const clearTimer = (key: string) => {
    if (timers.current[key]) {
      clearTimeout(timers.current[key]);
      delete timers.current[key];
    }
  };

  const flushSave = useCallback(async (key: string, payload: Partial<SiteConfig>) => {
    const current = (seq.current[key] = (seq.current[key] || 0) + 1);
    setStatusFor(key, 'saving');

    try {
      const saved = await apiFetch<SiteConfig>('/settings', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      if (seq.current[key] !== current) return;

      const latest = formRef.current;
      if (latest) {
        const next = { ...latest };
        let changed = false;
        for (const k of Object.keys(payload) as Array<keyof SiteConfig>) {
          const pv = (payload as any)[k];
          const fv = (latest as any)[k];
          if (JSON.stringify(fv) === JSON.stringify(pv) && (saved as any)[k] !== undefined) {
            (next as any)[k] = (saved as any)[k];
            changed = true;
          }
        }
        if (changed) setForm(next);

        if (
          key === 'homepageFeaturedCount' &&
          JSON.stringify(latest.homepageFeaturedCount) === JSON.stringify(payload.homepageFeaturedCount)
        ) {
          setFeaturedCountStr(String(saved.homepageFeaturedCount));
        }
      }

      setError('');
      setStatusFor(key, 'saved');
      timers.current[key] = setTimeout(() => setStatusFor(key, 'idle'), 2000);
    } catch (err) {
      if (seq.current[key] !== current) return;
      setStatusFor(key, 'error');
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    }
  }, []);

  const scheduleSave = useCallback(
    (key: string, payload: Partial<SiteConfig>, delay = SAVE_DELAY_MS) => {
      clearTimer(key);
      setStatusFor(key, 'idle');
      timers.current[key] = setTimeout(() => {
        delete timers.current[key];
        flushSave(key, payload);
      }, delay);
    },
    [flushSave],
  );

  const scheduleSocialSave = useCallback(
    (rows: SocialRow[]) => {
      const complete = rows
        .filter(isComplete)
        .map(({ platform, label, url }) => ({ platform, label, url }));
      const serialized = JSON.stringify(complete);
      if (serialized === lastSentSocial.current) {
        setStatusFor('socialLinks', 'idle');
        return;
      }
      lastSentSocial.current = serialized;
      scheduleSave('socialLinks', { socialLinks: complete });
    },
    [scheduleSave],
  );

  const updateRow = (id: string, patch: Partial<Pick<SocialRow, 'platform' | 'label' | 'url'>>) => {
    const next = socialRows.map((row) => (row.id === id ? { ...row, ...patch } : row));
    setSocialRows(next);
    scheduleSocialSave(next);
  };

  const removeRow = (id: string) => {
    const next = socialRows.filter((row) => row.id !== id);
    setSocialRows(next);
    scheduleSocialSave(next);
  };

  const addRow = (preset?: SocialLink) => {
    const next = [...socialRows, preset ? toSocialRow(preset) : { id: crypto.randomUUID(), platform: '', label: '', url: '' }];
    setSocialRows(next);
    scheduleSocialSave(next);
  };

  const retrySocial = () => {
    const complete = socialRows
      .filter(isComplete)
      .map(({ platform, label, url }) => ({ platform, label, url }));
    flushSave('socialLinks', { socialLinks: complete });
  };

  const handleCountChange = (value: string) => {
    setFeaturedCountStr(value);
    if (value.trim() === '') return;
    const n = Number(value);
    if (!Number.isFinite(n) || n < 1 || n > 5) {
      setStatusFor('homepageFeaturedCount', 'idle');
      return;
    }
    scheduleSave('homepageFeaturedCount', { homepageFeaturedCount: n });
  };

  const handleCountBlur = () => {
    if (!form) return;
    const n = Number(featuredCountStr);
    if (featuredCountStr.trim() === '' || !Number.isFinite(n) || n < 1 || n > 5) {
      setFeaturedCountStr(String(form.homepageFeaturedCount));
    }
  };

  const handleAutosaveToggle = (checked: boolean) => {
    setForm((f) => (f ? { ...f, autosaveEnabled: checked } : f));
    scheduleSave('autosaveEnabled', { autosaveEnabled: checked }, 0);
  };

  const handleIntervalChange = (value: number) => {
    setForm((f) => (f ? { ...f, autosaveIntervalMs: value } : f));
    scheduleSave('autosaveIntervalMs', { autosaveIntervalMs: value }, 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure homepage editorial behavior and editor defaults.
          </p>
        </div>
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive">
          {error || 'Settings not available'}
        </div>
      </div>
    );
  }

  const countOutOfRange = featuredCountStr.trim() !== '' && (Number(featuredCountStr) < 1 || Number(featuredCountStr) > 5);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure homepage editorial behavior and editor defaults.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-border/60 bg-card/30 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold">Homepage Settings</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Control how many featured posts appear in the hero + grid section.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="featured-count" className="text-sm font-medium">
              Featured Posts Count (1–5)
            </label>
            <input
              id="featured-count"
              type="number"
              min={1}
              max={5}
              step={1}
              value={featuredCountStr}
              onChange={(e) => handleCountChange(e.target.value)}
              onBlur={handleCountBlur}
              aria-invalid={countOutOfRange}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/30"
            />
            {countOutOfRange ? (
              <p className="text-xs text-destructive">Enter a number between 1 and 5.</p>
            ) : (
              <SaveStatus state={status['homepageFeaturedCount'] ?? 'idle'} idle="Auto-saves when you stop typing" />
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card/30 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold">Editor Settings</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Sets default autosave behavior for the visual editor.
          </p>
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.autosaveEnabled}
                onChange={(e) => handleAutosaveToggle(e.target.checked)}
                className="rounded border-input"
              />
              Autosave enabled
            </label>
            <SaveStatus state={status['autosaveEnabled'] ?? 'idle'} />
          </div>

          <div className="space-y-2 max-w-sm">
            <label htmlFor="autosave-interval" className="text-sm font-medium">
              Autosave Interval
            </label>
            <select
              id="autosave-interval"
              value={form.autosaveIntervalMs}
              onChange={(e) => handleIntervalChange(Number(e.target.value))}
              disabled={!form.autosaveEnabled}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-60"
            >
              {AUTOSAVE_INTERVAL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <SaveStatus state={status['autosaveIntervalMs'] ?? 'idle'} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card/30 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold">Social Links</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage social and contact links displayed in the site footer. Rows are auto-saved once
            platform, label, and URL are all filled in.
          </p>
        </div>

        <div className="space-y-3">
          {socialRows.map((row) => (
            <div key={row.id} className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-3">
              <div className="flex-1 grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <input
                    type="text"
                    value={row.platform}
                    onChange={(e) => updateRow(row.id, { platform: e.target.value })}
                    placeholder="Platform (e.g. instagram)"
                    aria-label="Platform"
                    className="rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-accent/30"
                  />
                </div>
                <div className="space-y-1">
                  <input
                    type="text"
                    value={row.label}
                    onChange={(e) => updateRow(row.id, { label: e.target.value })}
                    placeholder="Label (e.g. Instagram)"
                    aria-label="Label"
                    className="rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-accent/30"
                  />
                </div>
                <div className="space-y-1">
                  <input
                    type="text"
                    value={row.url}
                    onChange={(e) => updateRow(row.id, { url: e.target.value })}
                    placeholder="URL (e.g. https://...)"
                    aria-label="URL"
                    className="rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-accent/30"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 pt-0.5">
                {!isComplete(row) && (
                  <span className="hidden sm:inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                    Incomplete
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {socialRows.length === 0 && (
            <p className="rounded-xl border border-dashed border-border/60 px-4 py-6 text-center text-xs text-muted-foreground">
              No social links yet — add one below.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => addRow()}
            className="rounded-xl border border-dashed border-border/60 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-colors w-full"
          >
            + Add Social Link
          </button>
          <SaveStatus state={status['socialLinks'] ?? 'idle'} onRetry={retrySocial} />
        </div>

        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground font-medium">Quick add defaults</summary>
          <div className="mt-2 flex flex-wrap gap-2">
            {SOCIAL_PRESETS.map((preset) => (
              <button
                key={preset.platform}
                type="button"
                onClick={() => addRow(preset)}
                className="rounded-full border border-border/60 px-3 py-1.5 text-xs hover:border-foreground hover:text-foreground transition-colors"
              >
                + {preset.label}
              </button>
            ))}
          </div>
        </details>
      </section>
    </div>
  );
}
