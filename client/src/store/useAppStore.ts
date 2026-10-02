import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  targetRole: 'SDE' | 'Frontend' | 'Backend' | 'AI-ML';
  experienceLevel: 'fresher' | '1-2-years' | '3+-years';
  placementDate?: string;
  dailyHours: number;
  currentSkills: string[];
  targetCompanies: string[];
  preferredLanguage: 'English' | 'Hindi' | 'Hinglish';
  onboarded: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AppState {
  theme: 'dark' | 'light';
  language: 'English' | 'Hindi' | 'Hinglish';
  reducedMotion: boolean;
  profile: UserProfile;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isCommandPaletteOpen: boolean;
  isOffline: boolean;
  isSidebarCollapsed: boolean;
  
  // Actions
  login: (user: AuthUser, token?: string) => void;
  logout: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: (event?: React.MouseEvent) => void;
  setLanguage: (lang: 'English' | 'Hindi' | 'Hinglish') => void;
  setReducedMotion: (enabled: boolean) => void;
  setProfile: (profile: Partial<UserProfile>) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setIsOffline: (offline: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  resetAllData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      language: 'English',
      reducedMotion: false,
      isSidebarCollapsed: false,
      user: null,
      isAuthenticated: false,
      profile: {
        targetRole: 'SDE',
        experienceLevel: 'fresher',
        dailyHours: 3,
        currentSkills: ['Java', 'SQL', 'Data Structures', 'JavaScript'],
        targetCompanies: ['Google', 'Amazon', 'Microsoft', 'Flipkart'],
        preferredLanguage: 'English',
        onboarded: false
      },
      isCommandPaletteOpen: false,
      isOffline: false,

      login: (user, token) => {
        localStorage.setItem('preppilot_user_id', user.id);
        if (token) {
          localStorage.setItem('preppilot_token', token);
        }
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('preppilot_user_id');
        localStorage.removeItem('preppilot_token');
        set({ user: null, isAuthenticated: false });
      },

      setTheme: (theme) => {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
        set({ theme });
      },

      toggleTheme: (event) => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        // Check for View Transitions API support
        if (!(document as any).startViewTransition || !event) {
          document.documentElement.classList.remove('light', 'dark');
          document.documentElement.classList.add(newTheme);
          set({ theme: newTheme });
          return;
        }

        const x = event.clientX;
        const y = event.clientY;
        const endRadius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        );

        const transition = (document as any).startViewTransition(() => {
          document.documentElement.classList.remove('light', 'dark');
          document.documentElement.classList.add(newTheme);
          set({ theme: newTheme });
        });

        transition.ready.then(() => {
          const clipPath = [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`
          ];
          document.documentElement.animate(
            {
              clipPath: clipPath
            },
            {
              duration: 500,
              easing: 'ease-in-out',
              pseudoElement: '::view-transition-new(root)'
            }
          );
        });
      },

      setLanguage: (language) => set({ language }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setProfile: (partial) =>
        set((state) => ({ profile: { ...state.profile, ...partial } })),
      setCommandPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen }),
      toggleCommandPalette: () =>
        set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
      setIsOffline: (isOffline) => set({ isOffline }),
      toggleSidebarCollapsed: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setSidebarCollapsed: (isSidebarCollapsed) => set({ isSidebarCollapsed }),
      resetAllData: () => {
        localStorage.clear();
        window.location.href = '/';
      }
    }),
    {
      name: 'preppilot_app_store',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        reducedMotion: state.reducedMotion,
        isSidebarCollapsed: state.isSidebarCollapsed,
        profile: state.profile,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
