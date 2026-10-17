'use client';

import { useRouter } from 'next/navigation';
import { StoreApi, useStore } from 'zustand';
import { useQuery } from '@tanstack/react-query';
import { useContext, useEffect, createContext } from 'react';

import { getMe } from '@/services/users';
import { CurrentUserState } from '@/types';
import { clearTokens } from '@/lib/auth-token-storage';
import { createCurrentUserStore } from './current-user-store';

const CurrentUserStoreContext = createContext<StoreApi<CurrentUserState> | null>(null);

export const CurrentUserStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const {
    error,
    isLoading,
    data: currentUser,
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
    <CurrentUserStoreContext.Provider value={createCurrentUserStore({ currentUser })}>
      {children}
    </CurrentUserStoreContext.Provider>
  );
};

export const useCurrentUserStore = <T,>(selector: (state: CurrentUserState) => T): T => {
  const store = useContext(CurrentUserStoreContext);
  if (!store) throw new Error('Missing CurrentUserStoreProvider');
  return useStore(store, selector);
};
