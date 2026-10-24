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
    
    // Check against preset users
    const matchedRole = (Object.keys(PRESET_USERS) as UserRole[]).find(
      role => PRESET_USERS[role].email.toLowerCase() === email
    );

    if (matchedRole) {
      const user = PRESET_USERS[matchedRole];
      this.setUser(user);
      return user;
    }

    // Try API login if backend is reachable
    try {
      const res = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      if (res.ok) {
        const data = await res.json();
        const user: AuthUser = {
          id: data.user?.id || `usr-${Date.now()}`,
          name: data.user?.name || email.split('@')[0],
          email: email,
          role: data.user?.role || 'admin',
          roleTitle: data.user?.roleTitle || 'Authorized User',
          department: data.user?.department || 'Operations',
          avatarInitials: (email.split('@')[0].slice(0, 2) || 'AU').toUpperCase(),
        };
        this.setUser(user);
        return user;
      }
    } catch (e) {
      // Backend request fallback to super admin
    }

    // Fallback: create generic user session
    const fallbackUser: AuthUser = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0].replace('.', ' '),
      email: email,
      role: 'admin',
      roleTitle: 'Enterprise Administrator',
      department: 'Executive Governance',
      avatarInitials: (email.slice(0, 2)).toUpperCase(),
    };
    this.setUser(fallbackUser);
    return fallbackUser;
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
