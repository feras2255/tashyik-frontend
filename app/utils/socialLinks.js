const BUILTIN_SOCIAL_TYPES = ['facebook', 'instagram', 'twitter', 'youtube', 'tiktok', 'snapchat', 'linkedin', 'telegram', 'whatsapp'];

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
