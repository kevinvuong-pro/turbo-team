const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

const setTokens = (accessToken: string, refreshToken: string) => {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

const clearTokens = () => {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
};

const getAccessToken = () =>
  typeof window === 'undefined' ? null : window.localStorage.getItem(ACCESS_TOKEN_KEY);

const getRefreshToken = () =>
  typeof window === 'undefined' ? null : window.localStorage.getItem(REFRESH_TOKEN_KEY);

export { setTokens, clearTokens, getAccessToken, getRefreshToken };
