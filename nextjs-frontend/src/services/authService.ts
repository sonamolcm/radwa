import { AuthUser, LoginCredentials, PRESET_USERS, UserRole } from '../types/auth';

const STORAGE_KEY = 'radwa_erp_auth_user';

class AuthService {
  private currentUser: AuthUser | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.currentUser = JSON.parse(stored);
        }
      } catch (e) {
        console.error('Failed to parse stored auth user:', e);
      }
    }
  }

  getCurrentUser(): AuthUser | null {
    if (this.currentUser) return this.currentUser;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.currentUser = JSON.parse(stored);
          return this.currentUser;
        }
      } catch (e) {
        console.error('Failed to get stored auth user:', e);
      }
    }
    // Default to Super Administrator if none stored
    return PRESET_USERS.admin;
  }

  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const email = credentials.email.trim().toLowerCase();
    const password = credentials.password;

    if (!email) {
      throw new Error('Email or username is required.');
    }
    if (!password) {
      throw new Error('Password is required.');
    }

    // 1. Try API login if backend is reachable
    try {
      const res = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username: email, password })
      });
      if (res.ok) {
        const data = await res.json();
        const role = (data.user?.role?.toLowerCase() || 'admin') as UserRole;
        const preset = PRESET_USERS[role] || PRESET_USERS.admin;
        const user: AuthUser = {
          id: data.user?.id || preset.id,
          name: data.user?.name || preset.name,
          email: data.user?.email || preset.email,
          role: role in PRESET_USERS ? role : 'admin',
          roleTitle: data.user?.roleTitle || preset.roleTitle,
          department: data.user?.department || preset.department,
          avatarInitials: preset.avatarInitials,
          token: data.token || 'token-' + Date.now(),
        };
        this.setUser(user);
        return user;
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Invalid credentials. Access denied.');
      }
    } catch (e: any) {
      if (e.message && !e.message.includes('fetch') && e.message !== 'Failed to fetch') {
        throw e;
      }
      
      // 2. Strict fallback validation against preset users (offline mode)
      const normalizedEmail = email.includes('@') ? email : `${email}@radwa.sa`;
      const matchedRole = (Object.keys(PRESET_USERS) as UserRole[]).find(
        role => PRESET_USERS[role].email.toLowerCase() === normalizedEmail || role === email
      );

      if (matchedRole) {
        if (password !== 'radwa123') {
          throw new Error('Invalid password for this corporate account. Access denied.');
        }
        const user = PRESET_USERS[matchedRole];
        this.setUser(user);
        return user;
      }

      throw new Error('No corporate account found with this email or username. Access denied.');
    }
  }

  async loginAsRole(role: UserRole): Promise<AuthUser> {
    const user = PRESET_USERS[role] || PRESET_USERS.admin;
    this.setUser(user);
    return user;
  }

  logout(): void {
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.error('Failed to remove auth key:', e);
      }
    }
  }

  private setUser(user: AuthUser): void {
    this.currentUser = user;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } catch (e) {
        console.error('Failed to persist auth user:', e);
      }
    }
  }
}

export const authService = new AuthService();
