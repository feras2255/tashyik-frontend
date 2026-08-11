const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // matches Sanctum default (30 days)

/**
 * Single source for the Sanctum Bearer cookie.
 * Intentionally JS-readable so the client can attach Authorization headers;
 * httpOnly would require a server-side BFF that injects the token.
 */
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
