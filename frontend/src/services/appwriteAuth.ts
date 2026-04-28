type AppwriteUser = {
  $id: string;
  email: string;
  name?: string;
  labels?: string[];
  prefs?: Record<string, unknown>;
};

type AppwriteSession = {
  $id: string;
  userId: string;
};

const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || '';

const ensureProjectId = () => {
  if (!APPWRITE_PROJECT_ID) {
    throw new Error('VITE_APPWRITE_PROJECT_ID is not configured');
  }
};

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  ensureProjectId();

  const headers = new Headers(options.headers || {});
  headers.set('X-Appwrite-Project', APPWRITE_PROJECT_ID);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${APPWRITE_ENDPOINT}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    let message = 'Request failed';
    try {
      const payload = await response.json();
      message = payload?.message || payload?.error || message;
    } catch {
      // Ignore JSON parse errors and keep fallback message.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
};

export const getUserRole = (user: AppwriteUser | null): string => {
  if (!user) return 'CLIENT';

  const labels = user.labels || [];
  if (labels.includes('ADMIN')) return 'ADMIN';
  if (labels.includes('MANAGER')) return 'MANAGER';

  const roleFromPrefs = user.prefs?.role;
  if (typeof roleFromPrefs === 'string') {
    const normalized = roleFromPrefs.toUpperCase();
    if (normalized === 'ADMIN' || normalized === 'MANAGER' || normalized === 'CLIENT') {
      return normalized;
    }
  }

  return 'CLIENT';
};

export const appwriteAuth = {
  async register(params: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    phone?: string;
  }): Promise<AppwriteUser> {
    const name = [params.firstName, params.lastName].filter(Boolean).join(' ').trim();

    await request('/account', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'unique()',
        email: params.email,
        password: params.password,
        name: name || params.email,
      }),
    });

    await request<AppwriteSession>('/account/sessions/email', {
      method: 'POST',
      body: JSON.stringify({
        email: params.email,
        password: params.password,
      }),
    });

    await request('/account/prefs', {
      method: 'PATCH',
      body: JSON.stringify({
        prefs: {
          role: 'CLIENT',
          firstName: params.firstName || '',
          lastName: params.lastName || '',
          companyName: params.companyName || '',
          phone: params.phone || '',
        },
      }),
    });

    return request<AppwriteUser>('/account');
  },

  async login(email: string, password: string): Promise<AppwriteUser> {
    await request<AppwriteSession>('/account/sessions/email', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    return request<AppwriteUser>('/account');
  },

  async me(): Promise<AppwriteUser> {
    return request<AppwriteUser>('/account');
  },

  async logout(): Promise<void> {
    await request('/account/sessions/current', { method: 'DELETE' });
  },

  async updatePrefs(prefs: Record<string, unknown>): Promise<AppwriteUser> {
    return request<AppwriteUser>('/account/prefs', {
      method: 'PATCH',
      body: JSON.stringify({ prefs }),
    });
  },
};

export type { AppwriteUser };
