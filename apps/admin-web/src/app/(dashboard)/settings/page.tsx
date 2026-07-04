'use client';

import { useEffect, useState } from 'react';
import apiFetch from '../../../lib/api';
import type { SiteConfig } from '@dikshant/types';

const AUTOSAVE_INTERVAL_OPTIONS = [
  { value: 30000, label: '30 seconds' },
  { value: 60000, label: '1 minute' },
  { value: 120000, label: '2 minutes' },
  { value: 300000, label: '5 minutes' },
];

export default function SettingsPage() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await apiFetch<SiteConfig>('/settings');
        if (!active) return;
        setConfig(data);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const patchConfig = async (patch: Partial<SiteConfig>, key: string) => {
    if (!config) return;
    setError('');
    setSavingKey(key);

    const prev = config;
    const next = { ...config, ...patch };
    setConfig(next);

    try {
      const saved = await apiFetch<SiteConfig>('/settings', {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
      setConfig(saved);
    } catch (err) {
      setConfig(prev);
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!config) {
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
            <label className="text-sm font-medium">Featured Posts Count (1–5)</label>
            <input
              type="number"
              min={1}
              max={5}
              value={config.homepageFeaturedCount}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (!Number.isFinite(value)) return;
                patchConfig({ homepageFeaturedCount: value }, 'homepageFeaturedCount');
              }}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/30"
            />
            <p className="text-xs text-muted-foreground">
              {savingKey === 'homepageFeaturedCount' ? 'Saving…' : 'Saves instantly'}
            </p>
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
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={config.autosaveEnabled}
              onChange={(e) => patchConfig({ autosaveEnabled: e.target.checked }, 'autosaveEnabled')}
              className="rounded border-input"
            />
            Autosave enabled
          </label>

          <div className="space-y-2 max-w-sm">
            <label className="text-sm font-medium">Autosave Interval</label>
            <select
              value={config.autosaveIntervalMs}
              onChange={(e) => patchConfig({ autosaveIntervalMs: Number(e.target.value) }, 'autosaveIntervalMs')}
              disabled={!config.autosaveEnabled}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-60"
            >
              {AUTOSAVE_INTERVAL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              {savingKey === 'autosaveEnabled' || savingKey === 'autosaveIntervalMs' ? 'Saving…' : 'Saves instantly'}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card/30 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold">Social Links</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage social and contact links displayed in the site footer. Saves instantly.
          </p>
        </div>

        <div className="space-y-3">
          {(config.socialLinks || []).map((link, index) => (
            <div key={index} className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3">
              <div className="flex-1 grid grid-cols-3 gap-3">
                <input
                  type="text"
                  value={link.platform}
                  onChange={(e) => {
                    const updated = [...(config.socialLinks || [])];
                    updated[index] = { ...updated[index], platform: e.target.value };
                    patchConfig({ socialLinks: updated }, 'socialLinks');
                  }}
                  placeholder="Platform (e.g. instagram)"
                  className="rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-accent/30"
                />
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => {
                    const updated = [...(config.socialLinks || [])];
                    updated[index] = { ...updated[index], label: e.target.value };
                    patchConfig({ socialLinks: updated }, 'socialLinks');
                  }}
                  placeholder="Label (e.g. Instagram)"
                  className="rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-accent/30"
                />
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => {
                    const updated = [...(config.socialLinks || [])];
                    updated[index] = { ...updated[index], url: e.target.value };
                    patchConfig({ socialLinks: updated }, 'socialLinks');
                  }}
                  placeholder="URL (e.g. https://...)"
                  className="rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
              <button
                onClick={() => {
                  const updated = (config.socialLinks || []).filter((_, i) => i !== index);
                  patchConfig({ socialLinks: updated }, 'socialLinks');
                }}
                className="shrink-0 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            const updated = [...(config.socialLinks || []), { platform: '', label: '', url: '' }];
            patchConfig({ socialLinks: updated }, 'socialLinks');
          }}
          className="rounded-xl border border-dashed border-border/60 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-colors w-full"
        >
          + Add Social Link
        </button>

        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground font-medium">Quick add defaults</summary>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              { platform: 'instagram', label: 'Instagram', url: 'https://instagram.com/' },
              { platform: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/in/' },
              { platform: 'github', label: 'GitHub', url: 'https://github.com/' },
              { platform: 'twitter', label: 'Twitter / X', url: 'https://x.com/' },
              { platform: 'email', label: 'Email', url: 'mailto:' },
              { platform: 'phone', label: 'Phone', url: 'tel:' },
            ].map((preset) => (
              <button
                key={preset.platform}
                onClick={() => {
                  const updated = [...(config.socialLinks || []), preset];
                  patchConfig({ socialLinks: updated }, 'socialLinks');
                }}
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

