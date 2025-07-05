
// Utility functions for authenticated API calls
export function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const apiUrl = import.meta.env.VITE_API_URL || '';
  const fullUrl = url.startsWith('/') ? `${apiUrl}${url}` : url;

  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('token');
    window.location.href = '/';
    throw new Error('Authentication failed');
  }

  return response;
}

// Helper for JSON API calls
export async function apiCall<T = any>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  const response = await authenticatedFetch(url, options);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// Helper function to check if error is unauthorized
export function isUnauthorizedError(error: any): boolean {
  return error?.message?.includes('401') || 
         error?.message?.includes('Unauthorized') ||
         error?.message?.includes('Authentication failed') ||
         error?.message?.includes('Token akses diperlukan');
}
