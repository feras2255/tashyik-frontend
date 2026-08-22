const BUILTIN_SOCIAL_TYPES = ['facebook', 'instagram', 'twitter', 'youtube', 'tiktok', 'snapchat', 'linkedin', 'telegram', 'whatsapp'];

const MAPS_URL_PATTERN = /maps\.google|google\.com\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/i;
const LOCATION_LABEL_PATTERN = /موقع|location|map/i;

export const OFFICE_MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent('شركة تطبيق تشييك، شارع عبدالله بن الزبير، العريجاء الغربية، الرياض 14913');

export function isLocationSocialItem(item) {
  if (!item?.url) {
    return false;
  }

  const label = String(item.label || '');
  const url = String(item.url);

  return LOCATION_LABEL_PATTERN.test(label) || MAPS_URL_PATTERN.test(url);
}

/**
 * Footer contact "موقعنا" row: prefer the social extra maps link, else the office maps URL.
 */
export function resolveFooterLocation(socialLinks) {
  const match = normalizeSocialLinkItems(socialLinks).find(isLocationSocialItem);

  return {
    url: match?.url || OFFICE_MAPS_URL,
    label: match?.label || null,
  };
}

/**
 * Normalize layout social_links into ordered footer items (API `items` or legacy flat keys).
 */
export function normalizeSocialLinkItems(socialLinks) {
  if (!socialLinks || typeof socialLinks !== 'object') {
    return [];
  }

  if (Array.isArray(socialLinks.items)) {
    return socialLinks.items.filter((item) => item?.url);
  }

  const items = [];

  for (const type of BUILTIN_SOCIAL_TYPES) {
    const url = socialLinks[type];

    if (url) {
      items.push({ type, url });
    }
  }

  if (Array.isArray(socialLinks.extra)) {
    for (const extra of socialLinks.extra) {
      if (extra?.url) {
        items.push({
          type: 'extra',
          label: extra.label ?? null,
          url: extra.url,
        });
      }
    }
  }

  return items;
}
