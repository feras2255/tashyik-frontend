/**
 * Normalize user object from API responses (/user, verify-otp, /general/layout).
 */
export function extractApiUser(response) {
  if (!response || typeof response !== 'object') {
    return null;
  }

  const candidates = [response.user, response.data, response.payload?.user, response.payload, response];

  for (const candidate of candidates) {
    const user = unwrapUser(candidate);

    if (user) {
      return user;
    }
  }

  return null;
}

function unwrapUser(value) {
  if (!value || typeof value !== 'object') {
    return null;
  }

  if (value.id && (value.phone || value.name)) {
    return value;
  }

  if (value.data && typeof value.data === 'object') {
    return unwrapUser(value.data);
  }

  return null;
}
