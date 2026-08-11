/**
 * Archived/merged city placeholders must not be crawled or hydrate SSR pages.
 */
export function isArchivedCitySlug(slug) {
  return typeof slug === 'string' && slug.startsWith('archived-');
}

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

export { sanitizeRichHtml } from './sanitizeHtml';
