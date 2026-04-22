'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { seedDefaultMovements, seedDefaultTemplates } from '@/lib/seedData';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGoogleRedirect: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  signInWithGoogle: async () => {},
  signInWithGoogleRedirect: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);

      if (u) {
        // Seed data on first login (idempotent)
        try {
          await seedDefaultMovements(u.uid);
          await seedDefaultTemplates(u.uid);
        } catch (err) {
          console.error('Failed to seed data:', err);
        }
      }
    });
    return unsub;
  }, []);

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  const signInWithGoogle = async () => {
    if (!auth) {
      alert('Firebase Auth is not configured. Please add your credentials to .env.local');
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      const error = err as { code?: string };
      if (error.code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, provider);
      } else {
        throw err;
      }
    }
  };

  const signInWithGoogleRedirect = async () => {
    if (!auth) {
      alert('Firebase Auth is not configured. Please add your credentials to .env.local');
      return;
    }
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };


  return (
    <AuthContext.Provider value={{ user, loading, logout, signInWithGoogle, signInWithGoogleRedirect }}>
      {children}
    </AuthContext.Provider>
  );
}
