'use client';

import { useEffect, useRef, useState } from 'react';
import { Link2, Loader2, Upload } from 'lucide-react';
import { uploadFile, registerMediaUrl, type UploadResponse } from '@/lib/upload';

interface MediaFieldProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  onSelect?: (media: UploadResponse) => void;
  accept?: string;
  placeholder?: string;
  alt?: string;
}

export default function MediaField({
  label = 'Media',
  value,
  onChange,
  onSelect,
  accept = 'image/*,video/*,.pdf',
  placeholder = 'https://example.com/image.jpg',
  alt,
}: MediaFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'upload' | 'url'>('url');
  const [urlInput, setUrlInput] = useState(value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setUrlInput(value);
  }, [value]);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const result = await uploadFile(file);
      onChange(result.secure_url || result.publicUrl);
      onSelect?.(result);
      setUrlInput(result.secure_url || result.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUrlApply = async () => {
    const trimmed = urlInput.trim();
    onChange(trimmed);
    if (!trimmed || !trimmed.startsWith('http')) return;

    setLoading(true);
    setError('');
    try {
      const result = await registerMediaUrl(trimmed, alt);
      onSelect?.(result);
    } catch {
      // URL still works in editor even if media registry fails
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-muted-foreground uppercase">{label}</label>
        <div className="flex rounded-lg border border-input overflow-hidden text-[10px] font-semibold">
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-1 ${mode === 'url' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
          >
            URL
          </button>
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2 py-1 ${mode === 'upload' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
          >
            Upload
          </button>
        </div>
      </div>

      {mode === 'url' ? (
        <div className="flex gap-1.5">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onBlur={handleUrlApply}
            className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={handleUrlApply}
            disabled={loading}
            className="rounded-xl border border-input px-2.5 hover:bg-muted transition-colors"
            title="Apply URL"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-input bg-muted/20 px-3 py-3 text-xs font-semibold hover:bg-muted/40 transition-colors"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {loading ? 'Uploading to Cloudinary…' : 'Choose file (image, video, PDF)'}
          </button>
        </div>
      )}

      {value && (
        <p className="text-[10px] text-muted-foreground truncate" title={value}>
          {value}
        </p>
      )}

      {error && <p className="text-[10px] text-destructive">{error}</p>}
    </div>
  );
}
