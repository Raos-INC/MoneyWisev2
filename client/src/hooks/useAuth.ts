
import { useQuery } from "@tanstack/react-query";

async function fetchUser() {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found');
  }

  const apiUrl = import.meta.env.VITE_API_URL || '';
  const response = await fetch(`${apiUrl}/api/auth/user`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    throw new Error('Failed to fetch user');
  }

  return response.json();
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: fetchUser,
    retry: false,
    enabled: !!localStorage.getItem('token'),
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
  };
}

// Helper function to make authenticated requests
export async function makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const defaultHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const apiUrl = import.meta.env.VITE_API_URL || '';
  const fullUrl = url.startsWith('/') ? `${apiUrl}${url}` : url;

  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      ...defaultHeaders,
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
