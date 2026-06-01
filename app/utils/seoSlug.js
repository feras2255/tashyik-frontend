/**
 * Prefer API localized_slug for non-default locales; fall back to canonical slug.
 */
export function resolveEntitySlug(entity, fallbackSlug = '') {
  if (!entity) {
    return fallbackSlug;
  }

  const localized = entity.localized_slug;

  if (localized != null && String(localized).trim() !== '') {
    return String(localized).trim();
  }

  return entity.slug || fallbackSlug;
}

/**
 * Sanitize admin HTML before v-html (SSR/prerender-safe; no jsdom at build time).
 */
export function sanitizeRichHtml(html) {
  if (html == null || html === '') {
    return '';
  }

  return String(html)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/href\s*=\s*("|\')?\s*javascript:[^"'>\s]*/gi, 'href=$1#')
    .replace(/src\s*=\s*("|\')?\s*javascript:[^"'>\s]*/gi, 'src=$1#');
}
