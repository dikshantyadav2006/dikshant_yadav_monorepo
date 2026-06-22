import { API_URL } from './constants';

export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${path}`;
  
  const headers = new Headers(options.headers);
  if (
    options.body != null &&
    !(options.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // critical: allows cookies to be sent/received across domains
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred while fetching data';
    try {
      const data = await response.json();
      errorMessage = data.message || data.error || errorMessage;
    } catch (e) {
      // Fallback to text if JSON parse fails
      try {
        const text = await response.text();
        if (text) errorMessage = text;
      } catch (_) {}
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null as any;
  }

  return response.json();
}
export default apiFetch;
