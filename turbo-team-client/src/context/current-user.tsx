'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ReactNode, useContext, createContext } from 'react';

import { getMe } from '@/services/users';
import { CurrentUserContextType } from '@/types/user';
import { clearTokens } from '@/lib/auth-token-storage';

const CurrentUserContext = createContext<CurrentUserContextType | undefined>(undefined);

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const {
    isLoading,
    data: currentUser,
    error,
  } = useQuery({
    queryFn: getMe,
    queryKey: ['getMe'],
  });

  useEffect(() => {
    if (!isLoading && (error || !currentUser)) {
      clearTokens();
      router.replace('/login');
    }
  }, [currentUser, error, isLoading, router]);

  if (isLoading || !currentUser) return null;

  return (
    <CurrentUserContext.Provider value={{ currentUser }}>{children}</CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const context = useContext(CurrentUserContext);

  if (!context) throw new Error('useCurrentUser must be used within CurrentUserProvider');

  return context;
}
