import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.dikshantyadav.in';

export default function useHomepagePosts() {
  const [data, setData] = useState({ featured: [], latest: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/homepage-posts`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to load posts');
      const json = await res.json();
      setData({
        featured: json.featured || [],
        latest: json.latest || [],
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...data, loading, error, reload: load };
}
