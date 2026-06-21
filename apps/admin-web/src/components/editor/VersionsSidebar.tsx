'use client';

import React, { useEffect, useState } from 'react';
import { useVisualBuilderStore } from '../../features/visual-builder/store';
import { getPostVersions, restorePostVersion } from '../../features/visual-builder/api';
import { X, History, Loader2, ArrowLeftRight } from 'lucide-react';

interface VersionsSidebarProps {
  postId: string;
  onClose: () => void;
  onRestoreSuccess: (restoredData: any) => void;
}

export function VersionsSidebar({ postId, onClose, onRestoreSuccess }: VersionsSidebarProps) {
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringVersion, setRestoringVersion] = useState<number | null>(null);
  const [error, setError] = useState('');

  const loadVersions = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getPostVersions(postId);
      setVersions(data || []);
    } catch (err) {
      setError('Failed to load version history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVersions();
  }, [postId]);

  const handleRestore = async (version: number) => {
    setRestoringVersion(version);
    setError('');
    try {
      const res = await restorePostVersion(postId, version);
      onRestoreSuccess(res.canvasData);
      loadVersions(); // Reload list to show the new "Restored" version entry
    } catch (err) {
      setError(`Failed to restore version ${version}`);
      console.error(err);
    } finally {
      setRestoringVersion(null);
    }
  };

  return (
    <aside className="w-80 border-l border-border bg-card flex flex-col h-full flex-shrink-0 select-none z-10 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/60 bg-muted/10">
        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          <History className="w-4 h-4 text-primary" />
          <span>Version History</span>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-md transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {error && (
          <div className="text-[10px] text-destructive bg-destructive/5 border border-destructive/20 p-2.5 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-[10px]">Loading version history...</span>
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground/60 text-[10px]">
            No saved versions found.
          </div>
        ) : (
          <div className="space-y-3">
            {versions.map((ver) => {
              const date = new Date(ver.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              const isRestoring = restoringVersion === ver.version;

              return (
                <div 
                  key={ver.id}
                  className="p-3 bg-background rounded-xl border border-border/60 flex flex-col gap-2 hover:border-border transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-foreground">Version {ver.version}</span>
                    <span className="text-[9px] text-muted-foreground/80">{date}</span>
                  </div>
                  
                  {ver.changeLabel && (
                    <div className="text-[10px] text-muted-foreground bg-muted/40 px-2 py-1 rounded-md italic">
                      "{ver.changeLabel}"
                    </div>
                  )}

                  <button
                    onClick={() => handleRestore(ver.version)}
                    disabled={isRestoring || restoringVersion !== null}
                    className="w-full py-1.5 rounded-lg border border-primary/20 hover:border-primary bg-primary/5 hover:bg-primary/10 text-primary text-[10px] font-bold transition flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    {isRestoring ? (
                      <Loader2 className="w-3 animate-spin" />
                    ) : (
                      <ArrowLeftRight className="w-3 h-3" />
                    )}
                    <span>Restore Version</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}

export default VersionsSidebar;
