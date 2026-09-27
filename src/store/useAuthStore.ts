import { create } from 'zustand';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';

interface AuthState {
  user: User | null;
  initializing: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  initializing: isFirebaseConfigured,
  error: null,
  signUp: async (email, password) => {
    if (!auth) return;
    set({ error: null });
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
    } catch (e) {
      set({ error: friendlyAuthError(e) });
      throw e;
    }
  },
  signIn: async (email, password) => {
    if (!auth) return;
    set({ error: null });
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e) {
      set({ error: friendlyAuthError(e) });
      throw e;
    }
  },
  signOutUser: async () => {
    if (!auth) return;
    await signOut(auth);
  },
  clearError: () => set({ error: null }),
}));

// Wires Firebase's own auth-state stream into the store once, at module load.
if (auth) {
  onAuthStateChanged(auth, (user) => {
    useAuthStore.setState({ user, initializing: false });
  });
}

function friendlyAuthError(e: unknown): string {
  const code = (e as { code?: string })?.code ?? '';
  if (code.includes('email-already-in-use')) return 'That email already has an account — try signing in instead.';
  if (code.includes('invalid-email')) return 'That email address looks invalid.';
  if (code.includes('weak-password')) return 'Password should be at least 6 characters.';
  if (code.includes('user-not-found') || code.includes('wrong-password') || code.includes('invalid-credential')) {
    return 'Incorrect email or password.';
  }
  if (code.includes('network-request-failed')) return 'Network error — check your connection and try again.';
  return 'Something went wrong. Please try again.';
}
