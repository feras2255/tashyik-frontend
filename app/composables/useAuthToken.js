const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // matches Sanctum default (30 days)

export function useAuthToken() {
  const token = useCookie('token', {
    default: () => null,
    maxAge: TOKEN_MAX_AGE_SECONDS,
    sameSite: 'lax',
    secure: import.meta.env.PROD,
  });

  function setToken(newToken) {
    token.value = newToken;
  }

  function clearToken() {
    token.value = null;
  }

  return { token, setToken, clearToken };
}
