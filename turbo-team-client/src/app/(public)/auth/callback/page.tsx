'use client';

import { useLayoutEffect } from 'react';

import { setTokens } from '@/lib/auth-token-storage';

export default function GoogleAuthCallbackPage() {
  useLayoutEffect(() => {
    const tokenSource = window.location.hash
      ? window.location.hash.slice(1)
      : window.location.search.slice(1);
    const params = new URLSearchParams(tokenSource);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (!accessToken || !refreshToken) {
      window.location.replace('/login?error=google_callback');
      return;
    }

    setTokens(accessToken, refreshToken);
    window.location.replace('/');
  }, []);

  return null;
}
